import { getApiBaseUrl } from "@/lib/api-base";

const apiBaseUrl = getApiBaseUrl();

export type AdminUserRole = "admin" | "user";

export type AdminUser = {
  id: number;
  nickname: string;
  email: string;
  role: AdminUserRole;
};

export type AdminUserFilter = "all" | "admins" | "members";

function usersPath(filter: AdminUserFilter): string {
  if (filter === "admins") return "/admin/users/admins";
  if (filter === "members") return "/admin/users/members";
  return "/admin/users";
}

export async function fetchAdminUsers(filter: AdminUserFilter): Promise<AdminUser[]> {
  const res = await fetch(`${apiBaseUrl}${usersPath(filter)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.detail === "string" ? data.detail : "사용자 목록을 불러오지 못했습니다."
    );
  }
  return res.json();
}

export async function createAdminMember(body: {
  nickname: string;
  email: string;
  password: string;
  role: "user";
}): Promise<AdminUser> {
  const res = await fetch(`${apiBaseUrl}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : "계정 생성에 실패했습니다."
    );
  }
  return data;
}

export async function withdrawAdminMember(userId: number): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/admin/users/${userId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.detail === "string" ? data.detail : "탈퇴 처리에 실패했습니다."
    );
  }
}

export async function sendAdminWarning(
  userId: number,
  message: string
): Promise<{ id: number; admin_id: number; user_id: number; message: string }> {
  const res = await fetch(`${apiBaseUrl}/admin/users/${userId}/warnings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : "경고 전송에 실패했습니다."
    );
  }
  return data;
}
