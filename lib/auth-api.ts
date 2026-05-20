import { formatApiError } from "@/lib/format-api-error";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type AuthSession = {
  access_token: string;
  user_id: number;
  nickname: string;
  role: string;
};

export function saveAuthSession(data: AuthSession): void {
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("user_nickname", data.nickname);
  sessionStorage.setItem("user_role", data.role);
  sessionStorage.setItem("user_id", String(data.user_id));
}

export function clearAuthSession(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("user_nickname");
  sessionStorage.removeItem("user_role");
  sessionStorage.removeItem("user_id");
}

export type AdminSession = {
  access_token: string;
  email: string;
  nickname: string;
};

export async function loginAsAdmin(email: string, password: string): Promise<AdminSession> {
  const res = await fetch(`${apiBaseUrl}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data: Record<string, unknown> = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatApiError(data, "관리자 로그인에 실패했습니다."));
  }
  const token = data.access_token;
  const adminEmail = data.email;
  const nickname = data.nickname;
  if (typeof token !== "string" || typeof adminEmail !== "string" || typeof nickname !== "string") {
    throw new Error("관리자 로그인 응답 형식이 올바르지 않습니다.");
  }
  return { access_token: token, email: adminEmail, nickname };
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AuthSession> {
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data: Record<string, unknown> = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatApiError(data, "로그인에 실패했습니다."));
  }

  const token = data.access_token;
  const nickname = data.nickname;
  const role = data.role;
  const userId = data.user_id;

  if (
    typeof token !== "string" ||
    typeof nickname !== "string" ||
    typeof role !== "string" ||
    typeof userId !== "number"
  ) {
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");
  }

  return {
    access_token: token,
    user_id: userId,
    nickname,
    role,
  };
}
