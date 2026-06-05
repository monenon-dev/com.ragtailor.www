"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base";
import { TitanicNav } from "@/components/titanic-nav";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AuthUser = { nickname: string; role: string };

type IsidorCouple = {
  husband: string;
  wife: string;
  message: string;
  husband_survived: number | null;
  wife_survived: number | null;
  detail?: string;
};

function survivalLabel(value: number | null | undefined): string {
  if (value === 1) return "생존";
  if (value === 0) return "사망";
  return "미확인";
}

export default function IsidorBedPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [couple, setCouple] = useState<IsidorCouple | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const fetchCouple = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/titanic/isidor/bed`);
      const data = (await res.json().catch(() => ({}))) as IsidorCouple;
      if (!res.ok) {
        setCouple(null);
        setMessage(data.detail ?? "이소디어 정보를 불러오지 못했습니다.");
        return;
      }
      setCouple(data);
      setMessage(data.detail ?? "");
    } catch {
      setCouple(null);
      setMessage("이소디어 정보를 불러오지 못했습니다. 백엔드(8000)가 실행 중인지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCouple();
  }, [fetchCouple]);

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
                    타이타닉 데이터 수집, 월터 자기소개, 이소디어 정보 페이지로 이동합니다.
                  </SheetDescription>
                </SheetHeader>
                <TitanicNav active="isidor" />
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
        <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-rose-400">ISIDOR BED</p>
              <h1 className="mt-2 text-xl font-bold text-gray-900">이소디어의 정보</h1>
              <p className="mt-2 text-sm text-gray-600">
                타이타닉 승객 이소디어·이다 스트라우스 부부의 이야기와 Neon DB 생존 기록입니다.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                API: <code>/titanic/isidor/bed</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchCouple()}
              disabled={loading}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loading ? "불러오는 중..." : "새로고침"}
            </button>
          </div>

          {couple ? (
            <div className="mt-6 space-y-4">
              <blockquote className="rounded-xl border border-rose-100 bg-white p-5 text-sm italic text-gray-700">
                &ldquo;{couple.message}&rdquo;
              </blockquote>
              <dl className="grid gap-4 rounded-xl border border-rose-100 bg-white p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-gray-500">남편 (Husband)</dt>
                  <dd className="mt-1 font-medium text-gray-900">{couple.husband}</dd>
                  <dd className="mt-2 text-xs text-rose-700">
                    생존 여부: {survivalLabel(couple.husband_survived)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">아내 (Wife)</dt>
                  <dd className="mt-1 font-medium text-gray-900">{couple.wife}</dd>
                  <dd className="mt-2 text-xs text-rose-700">
                    생존 여부: {survivalLabel(couple.wife_survived)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {message ? <p className="mt-4 text-xs text-gray-600">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
