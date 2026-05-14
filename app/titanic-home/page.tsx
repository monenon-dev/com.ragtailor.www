"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type Row = Record<string, unknown>;

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export default function TitanicHomePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/titanic/data`);
        if (!res.ok) {
          throw new Error(`서버 응답 ${res.status}`);
        }
        const data: unknown = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("응답 형식이 올바르지 않습니다.");
        }
        if (!cancelled) setRows(data as Row[]);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
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

      <div className="flex-1 flex flex-col min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="shrink-0 mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              타이타닉 홈
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono break-words">
              backend/apps/titanic/app/Titanic-Dataset.csv →{" "}
              <span className="text-indigo-600 dark:text-indigo-400">GET /titanic/data</span>
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[15rem] shrink-0 self-start overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-md dark:border-gray-700 dark:bg-gray-900 aspect-video sm:mx-0 sm:max-w-[17rem]">
            <Image
              src="/images/titanic-pngtree-hero.jpg"
              alt="침몰하는 타이타닉 배 (Pngtree 페이지 대표 이미지)"
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 15rem, 17rem"
              priority
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/40 overflow-hidden">
          <div className="shrink-0 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              표 · {rows.length}행
              {columns.length > 0 ? ` · ${columns.length}열` : ""}
            </span>
            {loading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                불러오는 중
              </span>
            )}
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 dark:text-red-400 shrink-0">
              {error}
              <span className="block mt-1 text-xs text-gray-500 dark:text-gray-400">
                백엔드가 실행 중인지, NEXT_PUBLIC_API_BASE_URL이 맞는지 확인하세요.
              </span>
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">표시할 행이 없습니다.</div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="min-w-max w-full border-collapse text-left text-[11px] sm:text-xs">
                <thead className="sticky top-0 z-10 bg-white dark:bg-gray-950 shadow-sm">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-800 px-2 py-2 font-semibold text-gray-700 dark:text-gray-200 last:border-r-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-gray-800 dark:text-gray-200">
                  {rows.map((row, i) => (
                    <tr
                      key={
                        row.PassengerId !== undefined && row.PassengerId !== null
                          ? String(row.PassengerId)
                          : `row-${i}`
                      }
                      className="border-b border-gray-100 dark:border-gray-800/80 odd:bg-white/60 dark:odd:bg-gray-950/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
                    >
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="max-w-[14rem] truncate border-r border-gray-100 dark:border-gray-800/80 px-2 py-1.5 last:border-r-0"
                          title={cellText(row[col])}
                        >
                          {cellText(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
