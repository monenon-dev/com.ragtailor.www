/**
 * API 베이스 URL — Vercel에서는 NEXT_PUBLIC_API_BASE_URL 필수.
 * 로컬만 쓸 때는 미설정 시 http://127.0.0.1:8000
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[api] NEXT_PUBLIC_API_BASE_URL이 없습니다. Vercel 환경 변수에 백엔드 URL을 설정하세요."
    );
  }
  return "http://127.0.0.1:8000";
}
