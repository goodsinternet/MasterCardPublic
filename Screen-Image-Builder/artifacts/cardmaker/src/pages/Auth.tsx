import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Eye, EyeOff, Loader2, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export default function Auth() {
  const search = useSearch();
  const refFromUrl = new URLSearchParams(search).get("ref") ?? "";

  const [mode, setMode] = useState<Mode>(refFromUrl ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(refFromUrl.toUpperCase());
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
      <Link href="/" className="mb-8">
        <span className="font-semibold text-[20px] text-[#1d1d1f] tracking-[-0.01em]">CardMaker</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[400px] apple-card p-8"
      >
        {/* Mode toggle */}
        <div className="flex bg-[#f5f5f7] rounded-xl p-1 mb-7">
          {(["login", "register"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2 rounded-[10px] text-[14px] font-medium transition-all duration-200",
                mode === m
                  ? "bg-white text-[#1d1d1f] shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              )}
            >
              {m === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        <h1 className="text-[24px] font-bold text-[#1d1d1f] tracking-[-0.02em] mb-1">
          {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
        </h1>
        <p className="text-[14px] text-[#6e6e73] mb-7">
          {mode === "login"
            ? "Войдите, чтобы управлять карточками"
            : "3 бесплатные генерации при регистрации"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15 bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Минимум 6 символов"
                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[#d2d2d7] text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15 bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                Реферальный код{" "}
                <span className="text-[#6e6e73] font-normal">(необязательно)</span>
              </label>
              <div className="relative">
                {refFromUrl && (
                  <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0071e3]" />
                )}
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-xl border text-[15px] font-mono tracking-widest text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15 bg-white transition-all",
                    refFromUrl ? "pl-10 border-[#0071e3]/40 bg-[#f0f6ff]" : "border-[#d2d2d7]"
                  )}
                />
              </div>
              <p className="text-[12px] text-[#6e6e73] mt-1.5">
                {refFromUrl
                  ? "Код партнёра применён автоматически"
                  : "Ваш партнёр получит +3 генерации за приглашение"}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              mode === "login" ? "Войти" : "Создать аккаунт"
            )}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#6e6e73] mt-5">
          {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
