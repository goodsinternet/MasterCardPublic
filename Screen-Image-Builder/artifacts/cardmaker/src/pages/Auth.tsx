import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Eye, EyeOff, Loader2, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[15px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#4d9fff]/60 focus:ring-3 focus:ring-[#4d9fff]/15 transition-all";

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
      if (mode === "login") await login(email, password);
      else await register(email, password, referralCode || undefined);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse,_rgba(50,120,255,0.15)_0%,_transparent_70%)] pointer-events-none" />

      <Link href="/" className="mb-8 relative z-10">
        <span className="font-semibold text-[20px] text-white/80 tracking-[-0.01em]">CardMaker</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] glass-strong rounded-3xl p-8 relative z-10"
      >
        {/* Mode toggle */}
        <div className="flex bg-white/[0.05] rounded-xl p-1 mb-7">
          {(["login", "register"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2 rounded-[10px] text-[14px] font-medium transition-all duration-200",
                mode === m
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              {m === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        <h1 className="text-[24px] font-bold text-white tracking-[-0.025em] mb-1">
          {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
        </h1>
        <p className="text-[14px] text-white/40 mb-7">
          {mode === "login" ? "Войдите, чтобы управлять карточками" : "3 бесплатные генерации при регистрации"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-white/60 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={inputCls} />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-white/60 mb-1.5">Пароль</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Минимум 6 символов" className={cn(inputCls, "pr-11")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[13px] font-medium text-white/60 mb-1.5">
                Реферальный код <span className="text-white/30 font-normal">(необязательно)</span>
              </label>
              <div className="relative">
                {refFromUrl && <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d9fff]" />}
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className={cn(inputCls, "font-mono tracking-widest", refFromUrl && "pl-10 border-[#4d9fff]/30")}
                />
              </div>
              <p className="text-[12px] text-white/30 mt-1.5">
                {refFromUrl ? "Код партнёра применён автоматически" : "Ваш партнёр получит +3 генерации за приглашение"}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#4d9fff] text-white text-[15px] font-semibold hover:bg-[#6aaeff] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1 shadow-[0_0_30px_rgba(77,159,255,0.35)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>

        <p className="text-center text-[13px] text-white/35 mt-5">
          {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-[#4d9fff] hover:text-[#7ec4ff] font-medium transition-colors">
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
