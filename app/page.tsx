"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Terminal, Bot } from "lucide-react";

import { GeminiChatPanel } from "@/components/gemini-chat-panel";
import { WeatherWidget } from "@/components/weather-widget";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface AgentLogItem {
  [key: string]: string | number | boolean | null;
}

export default function MonenonAiApp() {
  const [view, setView] = useState<"chat" | "logs">("chat");

  return (
    <main className="min-h-screen min-h-dvh flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* 상단 사이트 헤더 — 전체 너비 */}
      <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-20">
        <div className="flex h-14 sm:h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-left text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight hover:opacity-90 transition-opacity"
          >
            Monenon AI Agent
          </Link>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </header> 

      {/* 히어로 — 소개 + 보기 전환 */}
      <section className="shrink-0 border-b border-gray-200/80 dark:border-gray-800 bg-gradient-to-b from-indigo-50/90 via-white to-white dark:from-indigo-950/40 dark:via-gray-950 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1 max-w-3xl">
              <h1 className="font-bold text-gray-900 dark:text-white leading-tight tracking-tight text-[clamp(0.95rem,2.2vw+0.45rem,3rem)] sm:text-[clamp(1.1rem,2vw+0.65rem,3.15rem)] sm:whitespace-nowrap">
                개발자를 위한{" "}
                <span className="text-indigo-600 dark:text-indigo-400">Agent Orchestration</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-mono">
                Orchestrating Intelligence for Developers
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                명령을 입력하면 Monenon AI가 도구 사용과 추론을 수행합니다. 실행 로그로 과정을 추적할 수 있습니다.
                채팅에서 &quot;서울 날씨 어때?&quot;처럼 물어볼 수도 있습니다.
              </p>
            </div>
            <WeatherWidget
              apiBaseUrl={apiBaseUrl}
              variant="hero"
              className="mx-auto lg:mx-0 lg:shrink-0 lg:mt-1"
            />
          </div>

          <nav className="mt-6 sm:mt-8 flex flex-wrap gap-3" aria-label="보기 전환">
            <button
              type="button"
              onClick={() => setView("chat")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                view === "chat"
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-800"
              }`}
            >
              <Bot size={18} />
              <span>Agent Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setView("logs")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                view === "logs"
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-800"
              }`}
            >
              <Terminal size={18} />
              <span>Execution Logs</span>
            </button>
          </nav>
        </div>
      </section>

      {/* 뷰포트 남는 높이: 중앙 여백 + 하단 명령 입력 (N 배지 위 pb) */}
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 pb-20 pt-4 sm:px-6 sm:pb-24 lg:px-8">
        {view === "chat" ? (
          <GeminiChatPanel
            className="w-full max-w-6xl"
            apiBaseUrl={apiBaseUrl}
            emptyTitle="Monenon Agent (Gemini) 대기 중"
            emptySubtitle="입력 후 전송하면 백엔드 POST /chat 으로 Gemini 응답을 받습니다."
            placeholder="질문하세요 (예: 서울 날씨 어때?, 한국의 수도는?)"
          />
        ) : (
          <MonenonLogPage />
        )}
      </div>
    </main>
  );
}

function MonenonLogPage() {
  const [logs, setLogs] = useState<AgentLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/agent/logs`);
      const result = await res.json();
      setLogs(result);
    } catch (err) {
      console.error("Logs fetch error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col min-h-0 space-y-4">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
          Trace: {logs.length} operations
        </p>
        <button
          type="button"
          onClick={fetchLogs}
          className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          aria-label="새로고침"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-3 flex-1 min-h-0 max-h-[min(70vh,48rem)] overflow-y-auto font-mono pr-1">
        {logs.map((log, idx) => (
          <article key={idx} className="border dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Step #{idx + 1}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {Object.entries(log).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                  <span className="text-gray-500">{key}</span>
                  <span className="text-gray-900 dark:text-gray-200 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}