"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  Bot,
  FileText,
  Wrench,
  BarChart3,
  Home,
  type LucideIcon,
} from "lucide-react";

export type PlatformSection =
  | "overview"
  | "users"
  | "user_settings"
  | "chat_sessions"
  | "messages"
  | "agent_configs"
  | "agent_logs"
  | "documents"
  | "tool_definitions"
  | "tool_usage_history"
  | "usage_stats";

export interface NavItem {
  id: PlatformSection;
  label: string;
  tableName: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const PLATFORM_NAV: NavGroup[] = [
  {
    title: "User & Session",
    icon: Users,
    items: [
      { id: "users", label: "Users", tableName: "users", icon: Users },
      { id: "user_settings", label: "User_Settings", tableName: "user_settings", icon: Settings },
      { id: "chat_sessions", label: "\uB300\uD654\uBC29", tableName: "chat_sessions", icon: MessageSquare },
    ],
  },
  {
    title: "AI Interaction",
    icon: Bot,
    items: [
      { id: "messages", label: "Messages", tableName: "messages", icon: MessageSquare },
      { id: "agent_configs", label: "Agent_Configs", tableName: "agent_configs", icon: Bot },
      { id: "agent_logs", label: "Agent_Logs", tableName: "agent_logs", icon: FileText },
    ],
  },
  {
    title: "RAG & Tools",
    icon: Wrench,
    items: [
      { id: "documents", label: "Documents", tableName: "documents", icon: FileText },
      { id: "tool_definitions", label: "Tool_Definitions", tableName: "tool_definitions", icon: Wrench },
      {
        id: "tool_usage_history",
        label: "Tool_Usage_History",
        tableName: "tool_usage_history",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Billing & Stats",
    icon: BarChart3,
    items: [
      { id: "usage_stats", label: "Usage_Stats", tableName: "usage_stats", icon: BarChart3 },
    ],
  },
];

interface PlatformSidebarLayoutProps {
  activeSection: PlatformSection;
  onSectionChange: (id: PlatformSection) => void;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function PlatformSidebarLayout({
  activeSection,
  onSectionChange,
  headerActions,
  children,
}: PlatformSidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleNavClick = (id: PlatformSection) => {
    onSectionChange(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen shrink-0
          border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950
          transition-[width,transform] duration-300 ease-in-out
          ${sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 overflow-hidden"}
        `}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              Platform
            </span>
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 lg:inline-flex"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            <div>
              <button
                type="button"
                onClick={() => handleNavClick("overview")}
                className={navButtonClass(activeSection === "overview")}
              >
                <LayoutDashboard size={18} className="shrink-0" />
                <span>Overview</span>
              </button>
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
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={navButtonClass(activeSection === item.id)}
                      >
                        <item.icon size={18} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <Home size={18} />
                Agent Chat Home
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md px-4 sm:px-6">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link
            href="/"
            className="text-base font-bold text-indigo-600 dark:text-indigo-400 sm:text-lg"
          >
            Monenon AI
          </Link>
          <span className="hidden sm:inline text-sm text-gray-500">DB Platform</span>
          <div className="ml-auto flex items-center gap-2">{headerActions}</div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function navButtonClass(active: boolean) {
  return `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
    active
      ? "bg-indigo-600 text-white shadow-sm"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
  }`;
}
