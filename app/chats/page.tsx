"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { HomeSidebar } from "@/components/layout/home-sidebar";
import { SessionChatView } from "@/components/chat/session-chat-view";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ChatsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedId = sessionStorage.getItem("user_id");
    if (storedId) {
      const parsed = Number(storedId);
      if (!Number.isNaN(parsed)) setUserId(parsed);
    }
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <HomeSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView="chat"
      />
      <div className="flex min-w-0 flex-1 flex-col min-h-0 overflow-hidden">
        <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-20">
          <div className="flex h-14 sm:h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
                aria-label={sidebarOpen ? "menu close" : "menu open"}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link
                href="/"
                className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                Monenon AI Agent
              </Link>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600"
            >
              홈으로
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-3 shrink-0">
            <h1 className="text-xl font-bold sm:text-2xl">대화방</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              저장된 채팅 세션을 선택해 이어서 대화할 수 있습니다.
            </p>
          </div>
          <SessionChatView
            apiBaseUrl={apiBaseUrl}
            userId={userId}
            className="h-full min-h-0 flex-1"
          />
        </main>
      </div>
    </div>
  );
}
