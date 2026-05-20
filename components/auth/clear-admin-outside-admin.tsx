"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { clearAdminSession } from "@/lib/session-user";

/** /admin 이외 페이지에서는 관리자 세션을 유지하지 않는다. */
export function ClearAdminSessionOutsideAdmin() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/admin")) {
      clearAdminSession();
    }
  }, [pathname]);

  return null;
}
