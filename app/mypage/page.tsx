"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, Pencil, Shield } from "lucide-react";

import { formatApiError } from "@/lib/format-api-error";

import { getApiBaseUrl } from "@/lib/api-base";

const apiBaseUrl = getApiBaseUrl();

interface UserProfile {
  id: number;
  nickname: string;
  email: string;
  role: string;
  created_at: string | null;
  profile_image_url: string | null;
}

function formatJoinDate(iso: string | null): string {
  if (!iso) return "정보 없음";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "정보 없음";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function roleLabel(role: string): string {
  if (role === "admin") return "관리자";
  if (role === "user") return "일반 회원";
  return role;
}

function avatarUrl(path: string | null, cacheKey: number): string | null {
  if (!path) return null;
  return `${apiBaseUrl}${path}?v=${cacheKey}`;
}

function initials(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2);
}

export default function MyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);

  const loadProfile = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/me?user_id=${userId}`);
      const data: Record<string, unknown> = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data, "프로필을 불러오지 못했습니다."));
        return;
      }
      setProfile(data as unknown as UserProfile);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const userId = sessionStorage.getItem("user_id");
    if (!token || !userId) {
      router.replace("/login");
      return;
    }
    loadProfile(userId);
  }, [router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const userId = sessionStorage.getItem("user_id");
    if (!file || !userId) return;

    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${apiBaseUrl}/auth/me/avatar?user_id=${userId}`, {
        method: "POST",
        body: form,
      });
      const data: Record<string, unknown> = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data, "프로필 사진 업로드에 실패했습니다."));
        return;
      }
      setProfile(data as unknown as UserProfile);
      setAvatarKey((k) => k + 1);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const imageSrc = profile ? avatarUrl(profile.profile_image_url, avatarKey) : null;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-md mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            Monenon AI Agent
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
            홈
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-12">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
          </div>
        )}

        {error && (
          <p className="mb-6 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3 text-center">
            {error}
          </p>
        )}

        {profile && !loading && (
          <>
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploading}
                className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="프로필 사진 변경"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={`${profile.nickname} 프로필`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-gray-400 dark:text-gray-500">
                      {initials(profile.nickname)}
                    </span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Loader2 className="animate-spin text-white" size={28} />
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 dark:bg-gray-600 text-white shadow-md border-2 border-white dark:border-gray-950 group-hover:bg-gray-900">
                  <Pencil size={16} />
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />

              <h1 className="mt-5 text-2xl font-bold tracking-tight">{profile.nickname}</h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 break-all px-4">
                {profile.email}
              </p>
            </div>

            <ul className="mt-12 border-t border-gray-200 dark:border-gray-800">
              <InfoRow icon={Shield} label="역할" value={roleLabel(profile.role)} />
              <InfoRow
                icon={Calendar}
                label="가입일"
                value={formatJoinDate(profile.created_at)}
              />
            </ul>

            <p className="mt-8 text-center text-xs text-gray-400">
              프로필 사진을 눌러 변경할 수 있습니다
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <Icon size={18} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </li>
  );
}
