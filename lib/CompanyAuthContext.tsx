"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface CompanyAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  companyId: string | null;
  companyName: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const CompanyAuthContext = createContext<CompanyAuthState>({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  companyId: null,
  companyName: null,
  login: async () => ({ success: false }),
  logout: () => {},
});

const STORAGE_KEY = "company_auth";

interface StoredAuth {
  token: string;
  companyId: string;
  companyName: string;
}

export function CompanyAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const auth: StoredAuth = JSON.parse(stored);
        setToken(auth.token);
        setCompanyId(auth.companyId);
        setCompanyName(auth.companyName);
      }
    } catch (error) {
      console.error("Failed to parse stored auth:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === "/company/login";
    const isCompanyPage = pathname?.startsWith("/company/") && !isLoginPage;

    if (!token && isCompanyPage) {
      router.push("/company/login");
    }
  }, [token, isLoading, pathname, router]);

  const login = useCallback(
    async (
      username: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/panel/api/company/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "Login failed" };
        }

        // Store auth
        const auth: StoredAuth = {
          token: data.token,
          companyId: data.companyId,
          companyName: data.companyName,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));

        setToken(data.token);
        setCompanyId(data.companyId);
        setCompanyName(data.companyName);

        return { success: true };
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Network error. Please try again." };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setCompanyId(null);
    setCompanyName(null);
    router.push("/company/login");
  }, [router]);

  return (
    <CompanyAuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isLoading,
        token,
        companyId,
        companyName,
        login,
        logout,
      }}
    >
      {children}
    </CompanyAuthContext.Provider>
  );
}

export const useCompanyAuth = () => useContext(CompanyAuthContext);
