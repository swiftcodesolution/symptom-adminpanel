// lib/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isCompanyAdmin: boolean;
  companyId: string | null;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isCompanyAdmin: false,
  companyId: null,
  token: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const idToken = await user.getIdToken();
          const idTokenResult = await user.getIdTokenResult();

          setToken(idToken);
          setIsAdmin(idTokenResult.claims.admin === true);
          setIsCompanyAdmin(idTokenResult.claims.companyAdmin === true);
          setCompanyId((idTokenResult.claims.companyId as string) || null);
        } catch (error) {
          console.error("Error getting token:", error);
          setToken(null);
          setIsAdmin(false);
          setIsCompanyAdmin(false);
          setCompanyId(null);
        }
      } else {
        setToken(null);
        setIsAdmin(false);
        setIsCompanyAdmin(false);
        setCompanyId(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, isCompanyAdmin, companyId, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
