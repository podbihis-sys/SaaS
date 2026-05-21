"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api/companies";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/api/client";
import type { AuthMeResponse, CompanySummary } from "@/lib/api/types";

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

export function useAuthMe() {
  return useQuery<AuthMeResponse>({
    queryKey: ["auth", "me"],
    queryFn: () => companiesApi.me(),
    staleTime: 60_000,
  });
}

export function useActiveCompany() {
  const me = useAuthMe();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!me.data) return;
    const cookie =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((r) => r.startsWith(`${ACTIVE_COMPANY_COOKIE}=`))
            ?.split("=")[1]
        : null;
    const fromCookie = cookie ? decodeURIComponent(cookie) : null;
    const initial =
      fromCookie && me.data.companies.some((c) => c.id === fromCookie)
        ? fromCookie
        : me.data.active_company_id ?? me.data.companies[0]?.id ?? null;
    if (initial) {
      setActiveId(initial);
      setCookie(ACTIVE_COMPANY_COOKIE, initial);
    }
  }, [me.data]);

  const switchTo = React.useCallback((id: string) => {
    setActiveId(id);
    setCookie(ACTIVE_COMPANY_COOKIE, id);
    if (typeof window !== "undefined") window.location.reload();
  }, []);

  const company: CompanySummary | undefined = React.useMemo(
    () => me.data?.companies.find((c) => c.id === activeId),
    [me.data, activeId],
  );

  return {
    me: me.data,
    isLoading: me.isLoading,
    isError: me.isError,
    company,
    activeId,
    companies: me.data?.companies ?? [],
    switchTo,
  };
}
