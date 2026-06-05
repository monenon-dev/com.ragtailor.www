import Link from "next/link";

export type TitanicNavActive = "upload" | "walter" | "isidor";

export function TitanicNav({ active }: { active: TitanicNavActive }) {
  const linkClass = (key: TitanicNavActive) =>
    key === active
      ? "rounded-md bg-gray-100 px-3 py-2 text-sm font-medium"
      : "rounded-md px-3 py-2 text-sm hover:bg-gray-100";

  return (
    <nav className="mt-6 flex flex-col gap-2">
      <Link href="/titanic-home" className={linkClass("upload")}>
        데이터 수집(CSV 업로드)
      </Link>
      <Link href="/titanic-home/passengers" className={linkClass("walter")}>
        월터의 자기소개
      </Link>
      <Link href="/titanic-home/isidor" className={linkClass("isidor")}>
        이소디어의 정보
      </Link>
    </nav>
  );
}
