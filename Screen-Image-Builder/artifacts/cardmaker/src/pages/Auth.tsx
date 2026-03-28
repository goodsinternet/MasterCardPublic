import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Star, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { login, register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, referralCode || undefined);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <Star className="w-5 h-5 fill-white/20" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-foreground">CardMaker</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl border border-border/40 shadow-sm p-8"
      >
        <div className="flex rounded-xl bg-secondary/40 p-1 mb-6">
          <button
            onClick={() => setMode("login")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
              mode === "login" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            Войти
          </button>
          <button
            onClick={() => setMode("register")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
              mode === "register" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            Регистрация
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-1">
          {mode === "login" ? "Добро пожаловать!" : "Создать аккаунт"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "login"
            ? "Войдите, чтобы управлять своими карточками"
            : "3 бесплатные генерации при регистрации"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Минимум 6 символов"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Реферальный код <span className="text-muted-foreground font-normal">(необязательно)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-mono tracking-widest"
              />
              <p className="text-xs text-muted-foreground mt-1">+2 бонусные генерации при использовании кода</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Войти" : "Создать аккаунт"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-primary font-medium hover:underline"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
