"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";

import { GeminiChatPanel, type GeminiChatMessage } from "@/components/chat/gemini-chat-panel";
import { TitanicNav } from "@/components/titanic-nav";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getApiBaseUrl } from "@/lib/api-base";

type AuthUser = { nickname: string; role: string };

type SmithProfile = {
  id: number;
  name: string;
};

type ChatTurn = { role: "user" | "assistant"; text: string };

type SmithChatResponse = {
  reply: string;
  rejected?: boolean;
  detail?: string;
};

const WELCOME_MESSAGE: GeminiChatMessage = {
  role: "assistant",
  text: "안녕하십니까. RMS 타이타닉의 스미스 선장입니다. 승객 명단, 생존, 침몰과 관련된 질문만 받겠습니다.",
  ts: new Date().toISOString(),
};

export default function SmithCaptainChatPage() {
  const apiBaseUrl = getApiBaseUrl();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<SmithProfile | null>(null);
  const historyRef = useRef<ChatTurn[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const nickname = sessionStorage.getItem("user_nickname");
    const role = sessionStorage.getItem("user_role");
    if (token && nickname) {
      setAuthUser({ nickname, role: role || "user" });
      return;
    }
    setAuthUser(null);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/titanic/smith/myself`);
        if (!res.ok) return;
        const data = (await res.json()) as SmithProfile;
        setProfile(data);
      } catch {
        setProfile(null);
      }
    })();
  }, [apiBaseUrl]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_nickname");
    sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("user_id");
    setAuthUser(null);
  };

  const handleSendMessage = useCallback(
    async (text: string): Promise<GeminiChatMessage> => {
      const res = await fetch(`${apiBaseUrl}/titanic/smith/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyRef.current,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as SmithChatResponse;
      if (!res.ok) {
        throw new Error(data.detail ?? `요청 실패 (${res.status})`);
      }

      historyRef.current = [
        ...historyRef.current,
        { role: "user", text },
        { role: "assistant", text: data.reply },
      ];

      return {
        role: "assistant",
        text: data.reply,
        ts: new Date().toISOString(),
      };
    },
    [apiBaseUrl]
  );

  return (
    <main className="min-h-dvh bg-white text-gray-900">
      <header className="shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur-md z-20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  aria-label="타이타닉 메뉴 열기"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Titanic 메뉴</SheetTitle>
                  <SheetDescription className="sr-only">
                    타이타닉 데이터 수집, 월터 자기소개, 스미스 선장 채팅으로 이동합니다.
                  </SheetDescription>
                </SheetHeader>
                <TitanicNav active="smith" />
              </SheetContent>
            </Sheet>
            <Link
              href="/"
              className="shrink-0 text-left text-lg font-bold tracking-tight text-indigo-600 hover:opacity-90 transition-opacity"
            >
              Monenon AI Agent
            </Link>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {authUser ? (
              <>
                <Link href="/mypage" className="text-sm font-medium text-indigo-600 px-2 hover:underline">
                  {authUser.nickname}님
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
          <p className="text-[11px] font-semibold tracking-widest text-slate-400">CAPTAIN SMITH</p>
          <h1 className="mt-2 text-xl font-bold text-gray-900">3. 스미스 선장 채팅</h1>
          <p className="mt-2 text-sm text-gray-600">
            {profile?.name ?? "Captain Edward John Smith"}와 대화합니다. 타이타닉 관련 질문만 답합니다.
          </p>
        </section>

        <GeminiChatPanel
          className="min-h-[520px]"
          placeholder="타이타닉에 대해 질문하세요 (예: 생존자는 몇 명인가요?)"
          emptyTitle="스미스 선장과 대화를 시작하세요"
          emptySubtitle="승객, 침몰, 생존 등 타이타닉 관련 질문만 받습니다."
          initialMessages={[WELCOME_MESSAGE]}
          onSendMessage={handleSendMessage}
        />
      </div>
    </main>
  );
}
