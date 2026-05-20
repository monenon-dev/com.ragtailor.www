"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Terminal, Bot, Menu, X, Shirt, Egg, Coffee, type LucideIcon } from "lucide-react";

import { HomeSidebar } from "@/components/layout/home-sidebar";
import { WeatherWidget } from "@/components/weather/weather-widget";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface AgentLogItem {
  [key: string]: string | number | boolean | null;
}

type AuthUser = { nickname: string; role: string };

const RECOMMENDED_TAGS: { label: string; prompt: string; icon: LucideIcon }[] = [
  { label: "오늘 옷차림 추천", prompt: "오늘 날씨에 맞는 옷차림을 추천해줘", icon: Shirt },
  { label: "냉장고 파먹기", prompt: "냉장고에 있는 재료로 만들 수 있는 요리를 추천해줘", icon: Egg },
  { label: "오늘의 한마디", prompt: "오늘 날씨에 맞는 한마디를 해줘", icon: Coffee },
];

export default function MonenonAiApp() {
  const router = useRouter();
  const [showLogs, setShowLogs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const handleRecommendedTag = (prompt: string) => {
    sessionStorage.setItem("chat_starter_prompt", prompt);
    sessionStorage.setItem("chat_starter_nonce", crypto.randomUUID());
    router.push("/chats");
  };

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const nickname = sessionStorage.getItem("user_nickname");
    const role = sessionStorage.getItem("user_role");
    if (token && nickname) {
      setAuthUser({ nickname, role: role || "user" });
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_nickname");
    sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("user_id");
    setAuthUser(null);
  };

  return (
    <div className="min-h-dvh flex bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <HomeSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={showLogs ? "logs" : null}
        onSelectLogs={() => setShowLogs(true)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-20">
          <div className="flex h-14 sm:h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
                aria-label={sidebarOpen ? "menu close" : "menu open"}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link
                href="/"
                className="shrink-0 text-left text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight hover:opacity-90 transition-opacity"
              >
                Monenon AI Agent
              </Link>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              {authUser ? (
                <>
                  <Link
                    href="/mypage"
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 px-2 hover:underline"
                  >
                    {authUser.nickname}님
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </header>

        <section className="border-b border-gray-200/80 dark:border-gray-800 bg-gradient-to-b from-indigo-50/90 via-white to-white dark:from-indigo-950/40 dark:via-gray-950 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="min-w-0 flex-1 max-w-3xl">
                <h1 className="font-bold text-gray-900 dark:text-white leading-tight tracking-tight text-[clamp(1.25rem,2.2vw+0.45rem,3rem)] sm:text-[clamp(1.5rem,2vw+0.65rem,3.15rem)]">
                  나만의{" "}
                  <span className="text-indigo-600 dark:text-indigo-400">일상 메이트</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                  명령하지 않아도 내 상황을 먼저 이해하는 똑똑한 AI와 대화해 보세요.
                </p>
              </div>
              <WeatherWidget
                apiBaseUrl={apiBaseUrl}
                variant="hero"
                className="mx-auto lg:mx-0 lg:shrink-0 lg:mt-1"
              />
            </div>

            <div className="mt-6 sm:mt-8" aria-label="보기 전환">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/chats"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-600 bg-indigo-600 text-white text-sm font-medium shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
                >
                  <Bot size={18} />
                  <span>Agent Chat</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogs((v) => !v)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    showLogs
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-800"
                  }`}
                >
                  <Terminal size={18} />
                  <span>Execution Logs</span>
                </button>
              </div>
              <div className="mt-[1cm] flex flex-wrap gap-1.5" aria-label="추천 태그">
                  {RECOMMENDED_TAGS.map(({ label, prompt, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleRecommendedTag(prompt)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-indigo-50/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-indigo-500 hover:bg-indigo-100/90 dark:bg-indigo-950/50 dark:text-gray-200 dark:hover:border-indigo-400 dark:hover:bg-indigo-950/80"
                    >
                      <Icon size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden />
                      <span>{label}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {showLogs && (
          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:pb-12 lg:px-8">
            <MonenonLogPage />
          </div>
        )}
      </div>
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

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex w-full max-w-6xl flex-col space-y-4">
      <div className="flex items-center justify-between gap-4">
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

      <div className="space-y-3 max-h-[min(70vh,48rem)] overflow-y-auto font-mono pr-1">
        {logs.map((log, idx) => (
          <article key={idx} className="border dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Step #{idx + 1}
              </span>
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
