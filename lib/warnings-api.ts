import { getApiBaseUrl } from "@/lib/api-base";

const apiBaseUrl = getApiBaseUrl();

export type Warning = {
  id: number;
  admin_id: number;
  user_id: number;
  message: string;
  created_at: string | null;
};

export async function fetchUserWarnings(userId: number): Promise<Warning[]> {
  const res = await fetch(`${apiBaseUrl}/auth/warnings?user_id=${userId}`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}
