"use client";

import { Loader2 } from "lucide-react";

import { resolveSecretaryPersona } from "@/lib/secretary-persona";
import { useWeather } from "@/lib/use-weather";
import { getApiBaseUrl } from "@/lib/api-base";

const MASCOT_IMAGE = "/image_a97703.png";

interface SecretaryPersonaProps {
  apiBaseUrl?: string;
  className?: string;
  nickname?: string | null;
}

export function SecretaryPersona({
  apiBaseUrl = getApiBaseUrl(),
  className = "",
  nickname,
}: SecretaryPersonaProps) {
  const { data, loading, error } = useWeather(apiBaseUrl);
  const persona = resolveSecretaryPersona(data, loading, error);
  const isLoggedIn = Boolean(nickname);

  const headline = isLoggedIn ? `${nickname}님, ${persona.message}` : "나만의 비서";

  return (
    <div
      className={`flex items-center gap-6 p-2 sm:gap-8 sm:p-3 lg:gap-10 ${className}`}
      aria-label={isLoggedIn ? `비서 인사 — ${nickname}님` : "나만의 비서"}
    >
      {/* 캐릭터 이미지 박스: overflow-visible을 추가하고 크기를 시원하게 고정 */}
      <div className="relative flex h-72 w-64 flex-shrink-0 items-center justify-center border-none bg-transparent shadow-none animate-mascot-float overflow-visible sm:h-80 sm:w-72 md:h-96 md:w-80 lg:h-[400px] lg:w-[320px]">
        <img
          src={MASCOT_IMAGE}
          alt="AI Agent"
          className="h-full w-full object-contain scale-[1.5] sm:scale-[1.6] lg:scale-[1.7] transform origin-center"
        />
      </div>

      {/* 말풍선 박스 */}
      <div className="relative max-w-xl rounded-3xl border border-slate-100 bg-white px-8 py-5 text-slate-800 shadow-sm sm:px-10 sm:py-6">
        <div className="absolute left-0 top-1/2 h-0 w-0 -translate-x-full -translate-y-1/2 border-b-[10px] border-b-transparent border-r-[16px] border-r-white border-t-[10px] border-t-transparent" />
        <div className="absolute left-0 top-1/2 -z-10 h-0 w-0 -translate-x-full -translate-y-1/2 border-b-[11px] border-b-transparent border-r-[17px] border-r-slate-100 border-t-[11px] border-t-transparent" />

        <p className="whitespace-nowrap text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {persona.mood === "loading" ? (
            <span className="inline-flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              잠깐만요…
            </span>
          ) : (
            headline
          )}
        </p>
      </div>
    </div>
  );
}