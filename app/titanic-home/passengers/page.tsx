"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AuthUser = { nickname: string; role: string };

type WalterProfile = {
  id: number;
  name: string;
  memo: string;
};

type TitanicRow = {
  PassengerId: number;
  Survived: number | null;
  Pclass: number;
  Name: string;
  gender: string;
  Age: number | null;
  SibSp: number;
  Parch: number;
  Ticket: string;
  Fare: number;
  Cabin: string | null;
  Embarked: string | null;
};

type PaginatedResponse = {
  items: TitanicRow[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  detail?: string;
};

const PAGE_SIZE = 50;
const COLUMNS: (keyof TitanicRow)[] = [
  "PassengerId",
  "Survived",
  "Pclass",
  "Name",
  "gender",
  "Age",
  "SibSp",
  "Parch",
  "Ticket",
  "Fare",
  "Cabin",
  "Embarked",
];

function TitanicNav({ active }: { active: "upload" | "walter" }) {
  const linkClass = (key: typeof active) =>
    key === active
      ? "rounded-md bg-gray-100 px-3 py-2 text-sm font-medium"
      : "rounded-md px-3 py-2 text-sm hover:bg-gray-100";

  return (
    <nav className="mt-6 flex flex-col gap-2">
      <Link href="/titanic-home" className={linkClass("upload")}>
        데이터 수집(CSV 업로드)
      </Link>
      <Link href="/titanic-home/passengers" className={linkClass("walter")}>
        월터의 자기소개
      </Link>
    </nav>
  );
}

export default function WalterPassengersPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<WalterProfile | null>(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [rows, setRows] = useState<TitanicRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowsMessage, setRowsMessage] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_nickname");
    sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("user_id");
    setAuthUser(null);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/titanic/walter/myself`);
      const data = (await res.json().catch(() => ({}))) as WalterProfile & { detail?: string };
      if (!res.ok) {
        setProfile(null);
        setProfileMessage(data.detail ?? "월터 소개를 불러오지 못했습니다.");
        return;
      }
      setProfile(data);
      setProfileMessage("");
    } catch {
      setProfile(null);
      setProfileMessage("월터 소개를 불러오지 못했습니다.");
    }
  }, []);

  const fetchRows = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/titanic/walter/passengers?page=${targetPage}&page_size=${PAGE_SIZE}`
      );
      const data = (await res.json().catch(() => ({}))) as PaginatedResponse & { detail?: string };
      if (!res.ok) {
        setRows([]);
        setRowsMessage(data.detail ?? "승객 명단을 불러오지 못했습니다.");
        setTotal(0);
        setTotalPages(1);
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      setRows(items);
      setPage(data.page ?? targetPage);
      setTotal(data.total ?? items.length);
      setTotalPages(Math.max(1, data.total_pages ?? 1));
      setRowsMessage(
        items.length > 0
          ? ""
          : (data.detail ?? "저장된 Passenger 데이터가 없습니다. CSV를 업로드해주세요.")
      );
    } catch {
      setRows([]);
      setRowsMessage("승객 명단을 불러오지 못했습니다.");
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await fetchProfile();
    await fetchRows(page);
  }, [fetchProfile, fetchRows, page]);

  useEffect(() => {
    void fetchProfile();
    void fetchRows(1);
  }, [fetchProfile, fetchRows]);

  const rangeStart = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = total > 0 ? Math.min(page * PAGE_SIZE, total) : 0;

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
                    타이타닉 데이터 수집 및 월터 자기소개 페이지로 이동합니다.
                  </SheetDescription>
                </SheetHeader>
                <TitanicNav active="walter" />
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

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
          <p className="text-[11px] font-semibold tracking-widest text-indigo-400">WALTER ROASTER</p>
          <h1 className="mt-2 text-xl font-bold text-gray-900">월터의 자기소개</h1>
          <p className="mt-2 text-sm text-gray-600">
            타이타닉 승무원 월터가 Neon DB의 Passenger 명단을 조회합니다.
          </p>

          {profile ? (
            <dl className="mt-5 grid gap-3 rounded-xl border border-indigo-100 bg-white p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-gray-500">ID</dt>
                <dd className="mt-1 font-medium text-gray-900">{profile.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Name</dt>
                <dd className="mt-1 font-medium text-gray-900">{profile.name}</dd>
              </div>
              <div className="sm:col-span-3">
                <dt className="text-xs text-gray-500">Memo</dt>
                <dd className="mt-1 font-medium text-gray-900">{profile.memo}</dd>
              </div>
            </dl>
          ) : null}
          {profileMessage ? <p className="mt-4 text-xs text-gray-600">{profileMessage}</p> : null}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-800">월터가 조회한 Passenger 명단</h2>
              <p className="mt-1 text-xs text-gray-500">
                API: <code>/titanic/walter/passengers</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refreshAll()}
              disabled={loading}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loading ? "불러오는 중..." : "새로고침"}
            </button>
          </div>

          {rowsMessage ? <p className="px-5 py-4 text-xs text-gray-600">{rowsMessage}</p> : null}

          {rows.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      {COLUMNS.map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.PassengerId} className="border-t border-gray-100">
                        {COLUMNS.map((col) => (
                          <td key={col} className="whitespace-nowrap px-3 py-2">
                            {row[col] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs">
                <p className="text-gray-600">
                  총 {total}명 중 {rangeStart}-{rangeEnd}명 표시
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchRows(Math.max(1, page - 1))}
                    disabled={page <= 1 || loading}
                    className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => void fetchRows(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages || loading}
                    className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
