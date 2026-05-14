"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { formatApiError } from "@/lib/format-api-error";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data: Record<string, unknown> = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data, "로그인에 실패했습니다."));
        return;
      }
      const token = data.access_token;
      if (typeof token === "string") {
        sessionStorage.setItem("access_token", token);
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Monenon AI Agent
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">계정으로 로그인</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/40 p-6 shadow-sm"
        >
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              이메일
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin size-4" /> : null}
            로그인
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            회원가입
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
            ← 홈으로
          </Link>
        </p>
      </div>
    </main>
  );
}
