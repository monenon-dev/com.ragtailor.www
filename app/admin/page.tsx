"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  type AdminUser,
  type AdminUserFilter,
  createAdminMember,
  fetchAdminUsers,
  sendAdminWarning,
  withdrawAdminMember,
} from "@/lib/admin-api";
import { clearAdminSession, getAdminNickname, isSessionAdmin } from "@/lib/session-user";

const FILTER_TABS: { key: AdminUserFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "admins", label: "관리자" },
  { key: "members", label: "일반 사용자" },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "관리자",
  user: "일반",
};

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<AdminUserFilter>("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const warningTarget = users.find((u) => u.id === actionUserId && u.role === "user") ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isSessionAdmin()) {
      router.replace("/admin/login?reason=not_admin");
    }
  }, [mounted, router]);

  const load = useCallback(async () => {
    if (!isSessionAdmin()) return;
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchAdminUsers(filter));
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (mounted && isSessionAdmin()) {
      load();
    }
  }, [mounted, load]);

  const handleWithdraw = async (user: AdminUser) => {
    const ok = window.confirm(
      `「${user.nickname}」(${user.email}) 계정을 탈퇴 처리할까요?\n관련 데이터(옷장·채팅 등)가 함께 삭제됩니다.`
    );
    if (!ok) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await withdrawAdminMember(user.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "탈퇴 처리에 실패했습니다.");
    } finally {
      setActionBusy(false);
    }
  };

  const openWarningModal = (user: AdminUser) => {
    setActionUserId(user.id);
    setWarningMessage("");
    setActionError(null);
  };

  const closeWarningModal = () => {
    setActionUserId(null);
    setWarningMessage("");
    setActionError(null);
  };

  const handleSendWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningTarget) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await sendAdminWarning(warningTarget.id, warningMessage.trim());
      closeWarningModal();
      window.alert(`「${warningTarget.nickname}」님에게 경고를 전송했습니다.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "경고 전송에 실패했습니다.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await createAdminMember({ nickname, email, password, role: "user" });
      setNickname("");
      setEmail("");
      setPassword("");
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isSessionAdmin()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="size-8 animate-spin text-violet-600" aria-label="불러오는 중" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={16} aria-hidden />
            홈
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-violet-700 dark:text-violet-300 sm:inline">
              {getAdminNickname()}
            </span>
            <button
              type="button"
              onClick={() => {
                clearAdminSession();
                router.replace("/admin/login");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              로그아웃
            </button>
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              새로고침
            </button>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <UserPlus size={14} />
              계정 추가
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            <Shield size={28} aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              관리자
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              일반 사용자 계정을 조회·생성하고, 탈퇴·경고를 처리합니다.
            </p>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">새 일반 사용자</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">닉네임</span>
                <input
                  required
                  maxLength={32}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">이메일</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">비밀번호</span>
                <input
                  required
                  type="password"
                  minLength={1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                />
              </label>
            </div>
            {formError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "생성 중…" : "생성"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
              >
                취소
              </button>
            </div>
          </form>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {actionError && !warningTarget && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {actionError}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Users size={16} aria-hidden />
              {loading ? "불러오는 중…" : `${users.length}명`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-950/80">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">닉네임</th>
                  <th className="px-4 py-3 font-semibold">이메일</th>
                  <th className="px-4 py-3 font-semibold">역할</th>
                  <th className="px-4 py-3 font-semibold text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      표시할 사용자가 없습니다.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-950/40">
                    <td className="px-4 py-3 font-mono tabular-nums text-gray-500">{user.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {user.nickname}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role === "user" ? (
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => openWarningModal(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100 dark:hover:bg-amber-950"
                          >
                            <AlertTriangle size={12} aria-hidden />
                            경고
                          </button>
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => handleWithdraw(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950"
                          >
                            <Trash2 size={12} aria-hidden />
                            탈퇴
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {warningTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="warn-dialog-title"
        >
          <form
            onSubmit={handleSendWarning}
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="warn-dialog-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  경고 보내기
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {warningTarget.nickname} · {warningTarget.email}
                </p>
              </div>
              <button
                type="button"
                onClick={closeWarningModal}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                경고 메시지
              </span>
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="예: 이용 규칙 위반이 확인되어 경고합니다."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </label>
            {actionError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{actionError}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeWarningModal}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={actionBusy || !warningMessage.trim()}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {actionBusy ? "전송 중…" : "경고 전송"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
