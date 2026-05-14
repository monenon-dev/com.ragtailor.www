"use client";

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from "react";
import Link from "next/link";
import { Send, Loader2, RefreshCw, Terminal, Bot, Cpu } from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface Message {
  role: "user" | "assistant";
  text: string;
  ts: string;
  confidence?: number;
  sources?: string[];
}

interface QaResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

interface AgentLogItem {
  [key: string]: string | number | boolean | null;
}

export default function MonenonAiApp() {
  const [view, setView] = useState<"chat" | "logs">("chat");

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* 상단 사이트 헤더 — 전체 너비 */}
      <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight hover:opacity-90 transition-opacity"
          >
            Monenon AI Agent
          </Link>
          <div className="flex items-center gap-2 shrink-0">
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

      {/* 히어로 — 데스크톱에서 넓게 읽히는 소개 구역 */}
      <section className="shrink-0 border-b border-gray-200/80 dark:border-gray-800 bg-gradient-to-b from-indigo-50/90 via-white to-white dark:from-indigo-950/40 dark:via-gray-950 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="max-w-6xl">
            <h1 className="font-bold text-gray-900 dark:text-white leading-tight tracking-tight whitespace-nowrap text-[clamp(0.95rem,2.2vw+0.45rem,3rem)] sm:text-[clamp(1.1rem,2vw+0.65rem,3.15rem)]">
              개발자를 위한{" "}
              <span className="text-indigo-600 dark:text-indigo-400">Agent Orchestration</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-mono">
              Orchestrating Intelligence for Developers
            </p>
            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              명령을 입력하면 Monenon AI가 도구 사용과 추론을 수행합니다. 실행 로그로 과정을 추적할 수 있습니다.
            </p>
          </div>

          <nav className="mt-8 sm:mt-10 flex flex-wrap gap-3" aria-label="보기 전환">
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

      {/* 메인 작업 영역 — 넓은 컨테이너 */}
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {view === "chat" ? <MonenonChatPage /> : <MonenonLogPage />}
      </div>
    </main>
  );
}

function MonenonChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuestion = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: question.trim(),
      ts: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);
    setLastQuestion(question.trim());

    try {
      // API 엔드포인트는 백엔드 설계에 맞춰 수정 필요 (예: /agent/run)
      const res = await fetch(`${apiBaseUrl}/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question.trim() }),
      });

      if (!res.ok) throw new Error(`Agent Error: ${res.status}`);

      const data: QaResponse = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        text: data.answer,
        ts: new Date().toISOString(),
        confidence: data.confidence,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLastQuestion(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "에이전트 응답에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(input);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 px-4 sm:px-6 py-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-16 sm:py-20">
            <Cpu size={56} className="mx-auto mb-4 opacity-25 text-indigo-500" />
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">Monenon Agent가 대기 중입니다.</p>
            <p className="text-sm mt-2 max-w-md mx-auto">도구 사용 및 추론 과정을 수행할 수 있습니다.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[min(100%,42rem)] sm:max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === "user" 
                ? "bg-indigo-600 text-white" 
                : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              {msg.role === "assistant" && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-[11px] opacity-70">
                  <span>신뢰도: {(msg.confidence || 0 * 100).toFixed(1)}%</span>
                  {msg.sources && <span className="ml-3">출처: {msg.sources.join(", ")}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <Loader2 className="animate-spin text-indigo-500 mx-auto" />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-4 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="에이전트에게 명령을 입력하세요..."
          className="flex-1 min-w-0 p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-900 resize-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-sm sm:text-base"
          rows={2}
        />
        <button
          type="submit"
          className="shrink-0 px-4 sm:px-5 py-3 bg-indigo-600 text-white rounded-xl self-end hover:bg-indigo-700 transition-colors"
          aria-label="전송"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
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
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
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