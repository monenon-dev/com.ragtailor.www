const defaultBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface ChatSessionItem {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface StoredMessage {
  id: number;
  session_id: number;
  role: string;
  content: string;
  created_at: string;
}

function base(apiBaseUrl?: string) {
  return (apiBaseUrl ?? defaultBase).replace(/\/$/, "");
}

export async function fetchChatSessions(
  userId: number,
  apiBaseUrl?: string
): Promise<ChatSessionItem[]> {
  const res = await fetch(`${base(apiBaseUrl)}/platform/chat-sessions?user_id=${userId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.detail === "string" ? data.detail : "대화방 목록을 불러오지 못했습니다."
    );
  }
  return res.json();
}

export async function fetchAllChatSessions(apiBaseUrl?: string): Promise<ChatSessionItem[]> {
  const res = await fetch(`${base(apiBaseUrl)}/platform/chat-sessions`);
  if (!res.ok) {
    throw new Error("대화방 목록을 불러오지 못했습니다.");
  }
  return res.json();
}

export async function createChatSession(
  userId: number,
  title = "새 대화",
  apiBaseUrl?: string
): Promise<ChatSessionItem> {
  const res = await fetch(`${base(apiBaseUrl)}/platform/chat-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, title }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "대화방 생성 실패");
  }
  return data;
}

export async function fetchSessionMessages(
  sessionId: number,
  userId: number,
  apiBaseUrl?: string
): Promise<StoredMessage[]> {
  const res = await fetch(
    `${base(apiBaseUrl)}/platform/chat-sessions/${sessionId}/messages?user_id=${userId}`
  );
  if (!res.ok) {
    throw new Error("메시지를 불러오지 못했습니다.");
  }
  return res.json();
}

export async function updateChatSessionTitle(
  sessionId: number,
  userId: number,
  title: string,
  apiBaseUrl?: string
): Promise<ChatSessionItem> {
  const res = await fetch(`${base(apiBaseUrl)}/platform/chat-sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, title }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "대화방 이름 수정 실패");
  }
  return data;
}

export async function saveSessionMessage(
  sessionId: number,
  userId: number,
  role: "user" | "assistant" | "system",
  content: string,
  apiBaseUrl?: string
): Promise<StoredMessage> {
  const res = await fetch(`${base(apiBaseUrl)}/platform/chat-sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, role, content }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "메시지 저장 실패");
  }
  return data;
}

export function formatSessionDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
