export const CHAT_STARTER_PROMPT_KEY = "chat_starter_prompt";
export const CHAT_STARTER_NONCE_KEY = "chat_starter_nonce";

export function saveChatStarter(prompt: string): string {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem(CHAT_STARTER_PROMPT_KEY, prompt);
  sessionStorage.setItem(CHAT_STARTER_NONCE_KEY, nonce);
  return nonce;
}

export function readChatStarter(): { prompt: string | null; nonce: string | null } {
  if (typeof window === "undefined") {
    return { prompt: null, nonce: null };
  }
  return {
    prompt: sessionStorage.getItem(CHAT_STARTER_PROMPT_KEY),
    nonce: sessionStorage.getItem(CHAT_STARTER_NONCE_KEY),
  };
}

export function clearChatStarter() {
  sessionStorage.removeItem(CHAT_STARTER_PROMPT_KEY);
  sessionStorage.removeItem(CHAT_STARTER_NONCE_KEY);
}

/** 홈 태그·카드 → 새 채팅방 생성 후 자동 질문 */
export function buildChatsUrl(prompt: string, nonce: string) {
  const params = new URLSearchParams({
    new: "1",
    prompt,
    nonce,
  });
  return `/chats?${params.toString()}`;
}

export function buildChatsSessionUrl(sessionId: number) {
  return `/chats?session=${sessionId}`;
}
