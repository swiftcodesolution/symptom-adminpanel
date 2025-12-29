// lib/useAuthFetch.ts
"use client";

import { useAuth } from "@/lib/AuthContext";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAuthFetch() {
  const { token } = useAuth();
  const router = useRouter();

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) {
        router.push("/");
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
        router.push("/");
        throw new Error("Session expired");
      }

      return response;
    },
    [token, router]
  );

  return authFetch;
}
