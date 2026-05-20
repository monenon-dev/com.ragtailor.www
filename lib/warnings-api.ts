const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type UserWarning = {
  id: number;
  user_id: number;
  message: string;
  created_at: string | null;
};

export async function fetchUserWarnings(userId: number): Promise<UserWarning[]> {
  const res = await fetch(`${apiBaseUrl}/auth/warnings?user_id=${userId}`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}
