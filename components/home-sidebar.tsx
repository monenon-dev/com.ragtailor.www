"use client";

import Link from "next/link";
import {
  Bot,
  Terminal,
  LayoutDashboard,
  Database,
  X,
} from "lucide-react";

import { PLATFORM_NAV } from "@/components/platform-sidebar-layout";

interface HomeSidebarProps {
  open: boolean;
  onClose: () => void;
  activeView?: "chat" | "logs" | null;
  onSelectLogs?: () => void;
}

export function HomeSidebar({
  open,
  onClose,
  activeView = null,
  onSelectLogs,
}: HomeSidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="sidebar overlay close"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen shrink-0
          border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950
          transition-[width,transform] duration-300 ease-in-out
          ${open ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 overflow-hidden"}
        `}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Menu</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
              aria-label="close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            <div>
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Home
              </p>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/chats"
                    onClick={onClose}
                    className={navClass(activeView === "chat")}
                  >
                    <Bot size={18} />
                    Agent Chat
                  </Link>
                </li>
                {onSelectLogs && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLogs();
                        onClose();
                      }}
                      className={navClass(activeView === "logs")}
                    >
                      <Terminal size={18} />
                      Execution Logs
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {PLATFORM_NAV.map((group) => (
              <div key={group.title}>
                <p className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <group.icon size={14} />
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={
                          item.id === "chat_sessions"
                            ? "/chats"
                            : `/dashboard?section=${item.id}`
                        }
                        onClick={onClose}
                        className={navClass(false)}
                      >
                        <item.icon size={18} />
                        <span className="truncate">
                          {item.id === "chat_sessions" ? "\uB300\uD654\uBC29" : item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                <Database size={18} />
                DB Dashboard
              </Link>
              <Link
                href="/dashboard?section=overview"
                onClick={onClose}
                className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <LayoutDashboard size={18} />
                Platform Overview
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}

function navClass(active: boolean) {
  return `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
    active
      ? "bg-indigo-600 text-white shadow-sm"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
  }`;
}
