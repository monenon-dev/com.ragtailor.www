"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Database,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ChatSessionsTable } from "@/components/chat-sessions-table";
import {
  PlatformSidebarLayout,
  PLATFORM_NAV,
  type PlatformSection,
} from "@/components/platform-sidebar-layout";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface TableCount {
  key: string;
  label: string;
  table_name: string;
  count: number;
  category: string;
  description: string;
}

interface PlatformOverview {
  tables: TableCount[];
  total_records: number;
}

const SECTION_DESCRIPTIONS: Record<PlatformSection, string> = {
  overview: "??? ?????? ??????? Neon DB ???? ??????? ?????????????.",
  users: "???, ????, ????? ??? ??? ????????? ?????? ????????????.",
  user_settings: "?????? ?????, ?????? AI ?? ??? ????????? ???? ??????????????.",
  chat_sessions: "?????? ???????? ???? ??????, ?????? ?????? ????????????.",
  messages: "role(user/assistant)? content?? ?????? ????? ?????? ???????????????.",
  agent_configs: "????????? ???, ????????? ??????????, ?????? AI ?? ??????????????.",
  agent_logs: "??????????? ???? ???, ?????? ??? ????? ?????? ????????????.",
  documents: "RAG???????? ??????????? ?????? ???????????????????.",
  tool_definitions: "?????? API, DB ????? ??? ????? ??? ???? ???????????????.",
  tool_usage_history: "?????? ???? ????? ????????????? ???????????.",
  usage_stats: "???? ?????????, API ????? ??????, ?????? ?????(??? ???)?????????.",
};

const VALID_SECTIONS = new Set<PlatformSection>([
  "overview",
  "users",
  "user_settings",
  "chat_sessions",
  "messages",
  "agent_configs",
  "agent_logs",
  "documents",
  "tool_definitions",
  "tool_usage_history",
  "usage_stats",
]);

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<PlatformSection>("overview");
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/platform/overview`);
      if (!res.ok) throw new Error("?????? ?????????? ?????????????.");
      setOverview(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "?????????? ?????");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section && VALID_SECTIONS.has(section as PlatformSection)) {
      setActiveSection(section as PlatformSection);
    }
  }, [searchParams]);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${apiBaseUrl}/platform/seed-demo`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.detail || "?????? ????? ?????? ??????");
        return;
      }
      await fetchOverview();
    } catch {
      alert("?????? ????? ???? ??????");
    } finally {
      setSeeding(false);
    }
  };

  const activeTable =
    activeSection === "overview"
      ? null
      : overview?.tables.find((t) => t.key === activeSection);

  const activeNavItem = PLATFORM_NAV.flatMap((g) => g.items).find((i) => i.id === activeSection);

  const headerActions = (
    <>
      <button
        type="button"
        onClick={fetchOverview}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        <span className="hidden sm:inline">???????</span>
      </button>
      <button
        type="button"
        onClick={handleSeedDemo}
        disabled={seeding}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
      >
        <Sparkles size={14} />
        <span className="hidden sm:inline">??????</span>
      </button>
    </>
  );

  return (
    <PlatformSidebarLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      headerActions={headerActions}
    >
      {error && (
        <p className="mb-6 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3">
          {error} ??? ???????(uvicorn)?? ?????? ????? ?????????????.
        </p>
      )}

      {activeSection === "overview" ? (
        <OverviewPanel overview={overview} loading={loading} />
      ) : activeSection === "chat_sessions" ? (
        <ChatSessionsTable apiBaseUrl={apiBaseUrl} />
      ) : (
        <FeaturePanel
          title={activeNavItem?.label ?? activeSection}
          tableName={activeTable?.table_name ?? activeSection}
          description={SECTION_DESCRIPTIONS[activeSection]}
          count={activeTable?.count ?? 0}
          category={activeTable?.category ?? ""}
          icon={activeNavItem?.icon}
          loading={loading}
        />
      )}
    </PlatformSidebarLayout>
  );
}

function OverviewPanel({
  overview,
  loading,
}: {
  overview: PlatformOverview | null;
  loading: boolean;
}) {
  const categories = overview
    ? [...new Set(overview.tables.map((t) => t.category))]
    : [];

  return (
    <>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-2">
          <Database size={16} />
          Neon PostgreSQL
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">??????? ?????</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
          ?????? ?????????? ???? ?????? ???? ?????? ???????? ???????????????. ?????? ????? ??????????? ?????? ?????? ???? ??????????????.
        </p>
      </div>

      {overview && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="?????? ???" value="10" />
          <StatCard label="? ???????" value={String(overview.total_records)} />
          <StatCard label="????" value="OK" accent="text-green-600 dark:text-green-400" />
          <StatCard label="DB" value="Neon" />
        </div>
      )}

      {loading && !overview && <p className="text-sm text-gray-500">??????????? ?????</p>}

      {categories.map((category) => {
        const items = overview?.tables.filter((t) => t.category === category) ?? [];
        return (
          <section key={category} className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((table) => (
                <div
                  key={table.key}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm font-medium">{table.label}</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {table.count}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{table.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}

function FeaturePanel({
  title,
  tableName,
  description,
  count,
  category,
  icon: Icon,
  loading,
}: {
  title: string;
  tableName: string;
  description: string;
  count: number;
  category: string;
  icon?: LucideIcon;
  loading: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-4 mb-6">
        {Icon && (
          <div className="rounded-xl bg-indigo-100 dark:bg-indigo-950 p-3 text-indigo-600 dark:text-indigo-400">
            <Icon size={28} />
          </div>
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{category}</p>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 font-mono">{tableName}</p>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{description}</p>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 sm:p-8">
        <p className="text-sm text-gray-500 mb-1">?????? ??????? ???</p>
        {loading ? (
          <p className="text-gray-400">????? ?????</p>
        ) : (
          <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {count}
          </p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          Neon ??????? <span className="font-mono">{tableName}</span>??????? ?????????????.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}
