"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileUp } from "lucide-react";
type AuthUser = { nickname: string; role: string };

export default function TitanicHomePage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

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

  return (
    <main className="min-h-dvh bg-white text-gray-900">
      <header className="shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur-md z-20">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-6">
          <Link
            href="/"
            className="shrink-0 text-left text-lg font-bold tracking-tight text-indigo-600 hover:opacity-90 transition-opacity"
          >
            Monenon AI Agent
          </Link>
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
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-widest text-gray-400">
              LESSON · TITANIC
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              1. 데이터 수집
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              캐글(Kaggle)에서 다운로드한 Titanic CSV를 업로드합니다. 수집된 데이터는 이후 Neon DB에 적재하는
              단계로 이어집니다.
            </p>
          </div>
          <div className="relative hidden h-36 w-72 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 lg:block">
            <Image
              src="/images/titanic-pngtree-hero.jpg"
              alt="침몰하는 타이타닉 배"
              fill
              className="object-cover object-center"
              sizes="18rem"
              priority
            />
          </div>
        </div>

        <section className="mt-14">
          <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white">
            <div className="px-10 py-14 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                <FileUp className="h-6 w-6" aria-hidden />
              </div>
              <p className="text-sm font-medium text-gray-800">CSV 파일 읽기 기능이 제거되었습니다.</p>
              <p className="mt-2 text-xs text-gray-500">
                프로젝트 내부/로컬 파일을 읽는 코드(`input type=file`, 드래그드롭, CSV 파싱)를 모두 삭제한
                상태입니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
