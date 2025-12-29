"use client";

import { useCompanyAuth } from "@/lib/CompanyAuthContext";
import { useCallback } from "react";

export function useCompanyFetch() {
  const { token, logout } = useCompanyAuth();

  const companyFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${token}`);

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      return response;
    },
    [token, logout]
  );

  return companyFetch;
}
