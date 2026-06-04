"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileUp, Menu } from "lucide-react";
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

export default function TitanicHomePage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

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

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("CSV 파일을 먼저 선택해주세요.");
      return;
    }

    setUploading(true);
    setUploadMessage("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 120_000);
      const res = await fetch(`${getApiBaseUrl()}/titanic/james/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      const data = (await res.json().catch(() => ({}))) as {
        count?: number;
        columns?: string[];
        detail?: string;
        persisted?: number;
      };

      if (!res.ok || data.detail) {
        setUploadMessage(data.detail ?? "업로드에 실패했습니다.");
        return;
      }

      const columnsText = Array.isArray(data.columns) ? data.columns.join(", ") : "";
      setUploadMessage(
        `업로드 완료: ${data.count ?? 0}건 수신됨` + (columnsText ? ` | 컬럼: ${columnsText}` : "")
      );
      router.push("/titanic-home/passengers");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setUploadMessage("업로드 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setUploadMessage("서버 연결에 실패했습니다. 백엔드(8000)가 실행 중인지 확인해주세요.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-white text-gray-900">
      <header className="shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur-md z-20">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-6">
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
                <nav className="mt-6 flex flex-col gap-2">
                  <Link href="/titanic-home" className="rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                    데이터 수집(CSV 업로드)
                  </Link>
                  <Link
                    href="/titanic-home/passengers"
                    className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    월터의 자기소개
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
              <p className="text-sm font-medium text-gray-800">Titanic CSV를 업로드해주세요.</p>
              <p className="mt-2 text-xs text-gray-500">
                업로드 주소: <code>/titanic/james/upload</code> (POST)
              </p>
              <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-3">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "업로드 중..." : "CSV 업로드"}
                </button>
                {uploadMessage ? <p className="text-xs text-gray-600">{uploadMessage}</p> : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
