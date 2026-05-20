import type { FoodPrefs } from "@/lib/user-settings";
import type { WeatherData } from "@/components/weather/weather-widget";

const defaultBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function base(apiBaseUrl?: string) {
  return (apiBaseUrl ?? defaultBase).replace(/\/$/, "");
}

export interface RefrigeratorItem {
  id: number;
  user_id: number;
  name: string;
  quantity?: string | null;
  expiry_date?: string | null;
  category?: string | null;
  note?: string | null;
  expiry_status?: string | null;
  days_until_expiry?: number | null;
}

export interface RefrigeratorOverview {
  weather: WeatherData;
  prefs: FoodPrefs;
  items: RefrigeratorItem[];
  expiring_soon: RefrigeratorItem[];
  weather_foods: { name: string; reason: string }[];
  preferred_foods: string[];
  summary: string;
}

const FETCH_TIMEOUT_MS = 20_000;

export async function fetchRefrigeratorOverview(
  userId: number,
  apiBaseUrl?: string
): Promise<RefrigeratorOverview> {
  const res = await fetch(
    `${base(apiBaseUrl)}/platform/refrigerator/overview?user_id=${userId}`,
    { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
  );
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseDetail(data, "냉장고 정보를 불러오지 못했습니다."));
  }
  return data as RefrigeratorOverview;
}

export async function createRefrigeratorItem(
  body: {
    user_id: number;
    name: string;
    quantity?: string;
    expiry_date?: string;
    category?: string;
    note?: string;
  },
  apiBaseUrl?: string
): Promise<RefrigeratorItem> {
  const res = await fetch(`${base(apiBaseUrl)}/platform/refrigerator/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseDetail(data, "식재료 등록 실패"));
  return data as RefrigeratorItem;
}

export async function deleteRefrigeratorItem(
  itemId: number,
  userId: number,
  apiBaseUrl?: string
): Promise<void> {
  const res = await fetch(
    `${base(apiBaseUrl)}/platform/refrigerator/items/${itemId}?user_id=${userId}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const data: unknown = await res.json().catch(() => ({}));
    throw new Error(parseDetail(data, "삭제 실패"));
  }
}

function parseDetail(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "detail" in data) {
    return String((data as { detail: unknown }).detail);
  }
  return fallback;
}

export function expiryBadge(status: string | null | undefined): {
  label: string;
  className: string;
} {
  switch (status) {
    case "expired":
      return {
        label: "유통기한 지남",
        className: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    case "urgent":
      return {
        label: "D-3 이내",
        className: "bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-200",
      };
    case "soon":
      return {
        label: "일주일 이내",
        className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
      };
    default:
      return {
        label: "여유",
        className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      };
  }
}
