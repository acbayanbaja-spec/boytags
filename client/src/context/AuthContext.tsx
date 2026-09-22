import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearSession, setSession } from "@/lib/api";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const me = await api<User>("/api/auth/me");
      setUser(me);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const access = localStorage.getItem("boytags.access") || sessionStorage.getItem("boytags.access");
    if (!access) {
      setLoading(false);
      return;
    }
    void refreshUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password, rememberMe) {
        const data = await api<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, rememberMe }),
        });
        setSession(data.accessToken, data.refreshToken, rememberMe);
        setUser(data.user);
        return data.user;
      },
      async register(input) {
        const data = await api<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(input),
        });
        setSession(data.accessToken, data.refreshToken, true);
        setUser(data.user);
        return data.user;
      },
      logout() {
        clearSession();
        setUser(null);
      },
      refreshUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
