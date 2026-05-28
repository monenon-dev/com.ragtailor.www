"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type AuthUser = { nickname: string; role: string };
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

const PAGE_SIZE = 50;

export default function TitanicPassengersPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [rows, setRows] = useState<TitanicRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rowsMessage, setRowsMessage] = useState("");
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(rows.length / PAGE_SIZE)), [rows.length]);
  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

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

  const fetchRows = async () => {
    setLoadingRows(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/titanic/data`);
      const data = (await res.json().catch(() => ({}))) as TitanicRow[] | { detail?: string };
      if (!res.ok) {
        setRows([]);
        setRowsMessage(typeof data === "object" && "detail" in data ? (data.detail ?? "") : "");
        setPage(1);
        return;
      }
      const nextRows = Array.isArray(data) ? data : [];
      setRows(nextRows);
      setRowsMessage(nextRows.length > 0 ? "" : "저장된 Passenger 데이터가 없습니다.");
      setPage(1);
    } catch {
      setRows([]);
      setRowsMessage("Passenger 데이터를 불러오지 못했습니다.");
      setPage(1);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-2">
                  <Link href="/titanic-home" className="rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                    데이터 수집(CSV 업로드)
                  </Link>
                  <Link
                    href="/titanic-home/passengers"
                    className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium"
                  >
                    고객 명단(Passenger)
                  </Link>
                </nav>
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section>
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h1 className="text-base font-semibold text-gray-800">Passenger 고객 명단</h1>
                <p className="mt-1 text-xs text-gray-500">Neon DB에서 가져온 Passenger 데이터</p>
              </div>
              <button
                type="button"
                onClick={fetchRows}
                disabled={loadingRows}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {loadingRows ? "불러오는 중..." : "새로고침"}
              </button>
            </div>

            {rowsMessage ? <p className="px-5 py-4 text-xs text-gray-600">{rowsMessage}</p> : null}

            {rows.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        {[
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
                        ].map((col) => (
                          <th key={col} className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((row) => (
                        <tr key={row.PassengerId} className="border-t border-gray-100">
                          <td className="whitespace-nowrap px-3 py-2">{row.PassengerId}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Survived ?? ""}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Pclass}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Name}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.gender}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Age ?? ""}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.SibSp}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Parch}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Ticket}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Fare}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Cabin ?? ""}</td>
                          <td className="whitespace-nowrap px-3 py-2">{row.Embarked ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs">
                  <p className="text-gray-600">
                    총 {rows.length}명 중 {(page - 1) * PAGE_SIZE + 1}-
                    {Math.min(page * PAGE_SIZE, rows.length)}명 표시
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page <= 1}
                      className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
                    >
                      이전
                    </button>
                    <span className="text-gray-700">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page >= totalPages}
                      className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

