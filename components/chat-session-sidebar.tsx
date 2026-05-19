"use client";

import { useEffect, useRef } from "react";
import { Loader2, MessageSquarePlus, Pencil, RefreshCw } from "lucide-react";

import { formatSessionDate, type ChatSessionItem } from "@/lib/chat-sessions";

interface ChatSessionSidebarProps {
  sessions: ChatSessionItem[];
  activeId: number | null;
  loading?: boolean;
  creating?: boolean;
  editingSessionId?: number | null;
  editTitle?: string;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  onRefresh?: () => void;
  onEditTitleChange?: (value: string) => void;
  onSaveTitle?: (sessionId: number) => void;
  onCancelEdit?: () => void;
  onStartEdit?: (sessionId: number, currentTitle: string) => void;
  className?: string;
}

export function ChatSessionSidebar({
  sessions,
  activeId,
  loading,
  creating,
  editingSessionId = null,
  editTitle = "",
  onSelect,
  onNewChat,
  onRefresh,
  onEditTitleChange,
  onSaveTitle,
  onCancelEdit,
  onStartEdit,
  className = "",
}: ChatSessionSidebarProps) {
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSessionId !== null) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingSessionId]);

  const commitEdit = (sessionId: number) => {
    onSaveTitle?.(sessionId);
  };

  return (
    <aside
      className={`flex h-full min-h-0 w-full sm:w-72 lg:w-80 shrink-0 flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 px-3 py-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">대화방</h2>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="새로고침"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          )}
          <button
            type="button"
            onClick={onNewChat}
            disabled={creating}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <MessageSquarePlus size={14} />}
            새 대화
          </button>
        </div>
      </div>

      <ul className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
        {loading && sessions.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-gray-500">
            <Loader2 className="mx-auto mb-2 animate-spin text-indigo-500" size={20} />
            불러오는 중…
          </li>
        )}
        {!loading && sessions.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-gray-500">
            대화방이 없습니다.
            <br />
            새 대화를 시작해 보세요.
          </li>
        )}
        {sessions.map((session) => {
          const active = activeId === session.id;
          const isEditing = editingSessionId === session.id;

          return (
            <li key={session.id}>
              <div
                className={`w-full rounded-xl px-3 py-3 transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => onEditTitleChange?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitEdit(session.id);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        onCancelEdit?.();
                      }
                    }}
                    onBlur={() => commitEdit(session.id)}
                    className={`w-full rounded-md border px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 ${
                      active
                        ? "border-indigo-400 bg-white text-gray-900"
                        : "border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
                    }`}
                    aria-label="대화방 이름"
                    maxLength={128}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    onDoubleClick={() => onStartEdit?.(session.id, session.title)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium truncate flex-1">{session.title}</p>
                      {active && onStartEdit && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartEdit(session.id, session.title);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              onStartEdit(session.id, session.title);
                            }
                          }}
                          className={`shrink-0 rounded p-0.5 ${
                            active ? "hover:bg-indigo-500" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                          aria-label="이름 수정"
                        >
                          <Pencil size={12} />
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-xs truncate ${
                        active ? "text-indigo-100" : "text-gray-500"
                      }`}
                    >
                      메시지 {session.message_count}개 · {formatSessionDate(session.updated_at)}
                    </p>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
