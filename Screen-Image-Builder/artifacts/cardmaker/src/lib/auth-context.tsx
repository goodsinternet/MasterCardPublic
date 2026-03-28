import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, saveAuth, clearAuth, isLoggedIn, type UserProfile } from "./api";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    if (!isLoggedIn()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.user.get();
      setUser(data.user);
    } catch {
      clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.auth.login(email, password);
    saveAuth(res.token);
    setUser(res.user);
  }

  async function register(email: string, password: string, referralCode?: string) {
    const res = await api.auth.register(email, password, referralCode);
    saveAuth(res.token);
    setUser(res.user);
  }

  async function logout() {
    await api.auth.logout().catch(() => {});
    clearAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
