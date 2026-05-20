"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Database,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ChatSessionsTable } from "@/components/chat/chat-sessions-table";
import {
  PlatformSidebarLayout,
  PLATFORM_NAV,
  type PlatformSection,
} from "@/components/layout/platform-sidebar-layout";

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
  overview: "전체 테이블 현황과 Neon DB 연결 상태를 확인합니다.",
  users: "이름, 이메일, 가입 정보 등 사용자 계정을 관리합니다.",
  user_settings: "언어 설정, 선호 AI 모델 등 사용자 환경 설정입니다.",
  chat_sessions: "여러 메시지를 묶는 채팅방, 세션 단위 정보입니다.",
  messages: "role(user/assistant)과 content로 구성된 실제 대화 내용입니다.",
  agent_configs: "에이전트 이름, 시스템 프롬프트, 사용 AI 모델 설정입니다.",
  agent_logs: "에이전트의 사고 과정, 에러 등 내부 실행 로그입니다.",
  documents: "RAG용으로 업로드한 문서의 메타데이터입니다.",
  tool_definitions: "날씨 API, DB 검색 등 외부 도구 정의 스펙입니다.",
  tool_usage_history: "어떤 도구를 언제 호출했는지 기록합니다.",
  usage_stats: "토큰 사용량, API 호출 횟수, 예상 비용(과금 관리)입니다.",
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
      if (!res.ok) throw new Error("개요를 불러오지 못했습니다.");
      setOverview(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
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
        alert(data.detail || "샘플 데이터 생성 실패");
        return;
      }
      await fetchOverview();
    } catch {
      alert("샘플 데이터 요청 실패");
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
        <span className="hidden sm:inline">새로고침</span>
      </button>
      <button
        type="button"
        onClick={handleSeedDemo}
        disabled={seeding}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
      >
        <Sparkles size={14} />
        <span className="hidden sm:inline">샘플</span>
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
          {error} — 백엔드(uvicorn)가 실행 중인지 확인하세요.
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">플랫폼 개요</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
          행버거 버튼으로 왼쪽 메뉴를 열고 기능별 테이블을 선택하세요. 다시 누르면 사이드바가 닫혀 콘텐츠 공간이 넓어집니다.
        </p>
      </div>

      {overview && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="테이블 수" value="10" />
          <StatCard label="총 레코드" value={String(overview.total_records)} />
          <StatCard label="연결" value="OK" accent="text-green-600 dark:text-green-400" />
          <StatCard label="DB" value="Neon" />
        </div>
      )}

      {loading && !overview && <p className="text-sm text-gray-500">불러오는 중…</p>}

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
        <p className="text-sm text-gray-500 mb-1">현재 레코드 수</p>
        {loading ? (
          <p className="text-gray-400">로딩 중…</p>
        ) : (
          <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {count}
          </p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          Neon 콘솔의 <span className="font-mono">{tableName}</span> 테이블과 동기화됩니다.
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
