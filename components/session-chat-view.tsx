"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ChatSessionSidebar } from "@/components/chat-session-sidebar";
import {
  GeminiChatPanel,
  type GeminiChatMessage,
} from "@/components/gemini-chat-panel";
import {
  createChatSession,
  fetchChatSessions,
  fetchSessionMessages,
  saveSessionMessage,
  updateChatSessionTitle,
  type ChatSessionItem,
} from "@/lib/chat-sessions";

interface SessionChatViewProps {
  apiBaseUrl: string;
  userId: number | null;
  className?: string;
}

function toGeminiMessages(rows: { role: string; content: string; created_at: string }[]): GeminiChatMessage[] {
  return rows
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      text: m.content,
      ts: m.created_at,
    }));
}

export function SessionChatView({ apiBaseUrl, userId, className = "" }: SessionChatViewProps) {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [history, setHistory] = useState<GeminiChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadSessions = useCallback(async () => {
    if (!userId) return;
    setLoadingSessions(true);
    try {
      const list = await fetchChatSessions(userId, apiBaseUrl);
      setSessions(list);
      setActiveId((prev) => {
        if (prev !== null && list.some((s) => s.id === prev)) return prev;
        return list.length > 0 ? list[0].id : null;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  }, [userId, apiBaseUrl]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!userId || activeId === null) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMessages(true);
      try {
        const rows = await fetchSessionMessages(activeId, userId, apiBaseUrl);
        if (!cancelled) {
          setHistory(toGeminiMessages(rows));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId, userId, apiBaseUrl]);

  const handleNewChat = async () => {
    if (!userId) return;
    setCreating(true);
    try {
      const created = await createChatSession(userId, "새 대화", apiBaseUrl);
      setSessions((prev) => [created, ...prev]);
      setActiveId(created.id);
      setHistory([]);
      setEditingSessionId(created.id);
      setEditTitle("새 대화");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (sessionId: number, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle);
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleSaveTitle = async (sessionId: number) => {
    if (!userId) return;
    const trimmed = editTitle.trim() || "새 대화";
    const session = sessions.find((s) => s.id === sessionId);
    if (session && session.title === trimmed) {
      setEditingSessionId(null);
      setEditTitle("");
      return;
    }
    try {
      const updated = await updateChatSessionTitle(sessionId, userId, trimmed, apiBaseUrl);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
    } catch (err) {
      console.error(err);
    } finally {
      setEditingSessionId(null);
      setEditTitle("");
    }
  };

  const handleSendMessage = useCallback(
    async (text: string): Promise<GeminiChatMessage> => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }

      let sessionId = activeId;
      if (sessionId === null) {
        const created = await createChatSession(userId, text.slice(0, 40) || "새 대화", apiBaseUrl);
        sessionId = created.id;
        setActiveId(created.id);
        setSessions((prev) => [created, ...prev]);
        setEditingSessionId(created.id);
        setEditTitle(created.title);
      }

      await saveSessionMessage(sessionId, userId, "user", text, apiBaseUrl);

      const res = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof raw === "object" && raw !== null && "detail" in raw && typeof (raw as { detail: string }).detail === "string"
            ? (raw as { detail: string }).detail
            : `요청 실패 (${res.status})`;
        throw new Error(detail);
      }
      const reply =
        typeof raw === "object" && raw !== null && "reply" in raw && typeof (raw as { reply: string }).reply === "string"
          ? (raw as { reply: string; model?: string }).reply
          : "";
      const model =
        typeof raw === "object" && raw !== null && "model" in raw && typeof (raw as { model: string }).model === "string"
          ? (raw as { model: string }).model
          : undefined;

      await saveSessionMessage(sessionId, userId, "assistant", reply, apiBaseUrl);

      const updated = await fetchChatSessions(userId, apiBaseUrl);
      setSessions(updated);

      return {
        role: "assistant",
        text: reply,
        ts: new Date().toISOString(),
        model,
      };
    },
    [activeId, userId, apiBaseUrl]
  );

  const initialMessages = useMemo(() => history, [history]);

  if (!userId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          대화방을 저장하려면 로그인해 주세요.
        </p>
        <Link
          href="/login"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex h-full min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4 ${className}`}>
      <ChatSessionSidebar
        sessions={sessions}
        activeId={activeId}
        loading={loadingSessions}
        creating={creating}
        editingSessionId={editingSessionId}
        editTitle={editTitle}
        onSelect={(id) => {
          setActiveId(id);
          if (editingSessionId !== null && editingSessionId !== id) {
            handleCancelEdit();
          }
        }}
        onNewChat={handleNewChat}
        onRefresh={loadSessions}
        onEditTitleChange={setEditTitle}
        onSaveTitle={handleSaveTitle}
        onCancelEdit={handleCancelEdit}
        onStartEdit={handleStartEdit}
        className="max-h-[min(20vh,8.5rem)] sm:max-h-[min(24vh,10rem)] lg:max-h-none"
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {loadingMessages && activeId !== null ? (
          <p className="text-sm text-gray-500 py-8 text-center">대화 불러오는 중…</p>
        ) : (
          <GeminiChatPanel
            className="h-full min-h-0 flex-1"
            apiBaseUrl={apiBaseUrl}
            initialMessages={initialMessages}
            resetKey={activeId ?? "new"}
            onSendMessage={handleSendMessage}
            placeholder="질문하세요 (예: 서울 날씨 어때?, 한국의 수도는?)"
          />
        )}
      </div>
    </div>
  );
}
