import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4d9fff] to-[#1a6fdf] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M10 2.5L3.5 7.5v10h4v-6h5v6h4V7.5L10 2.5z" fill="white" fillOpacity="0.95"/>
              </svg>
            </div>
            <span className="font-semibold text-[16px] text-white/90 tracking-[-0.01em]">CardMaker</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link href="/generator" className="text-[14px] text-white/50 hover:text-white/90 transition-colors">
              Генератор
            </Link>
            <Link href="/dashboard" className="text-[14px] text-white/50 hover:text-white/90 transition-colors">
              Партнёрка
            </Link>
            <Link href="/faq" className="text-[14px] text-white/50 hover:text-white/90 transition-colors">
              FAQ
            </Link>
            {user?.isAdmin && (
              <Link href="/admin" className="text-[14px] text-[#4d9fff]/80 hover:text-[#4d9fff] transition-colors">
                Админ
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link href="/dashboard">
                <button className="text-[14px] font-medium text-white/60 hover:text-white/90 transition-colors">Кабинет</button>
              </Link>
            ) : (
              <Link href="/auth">
                <button className="text-[14px] font-medium text-white/60 hover:text-white/90 transition-colors">Войти</button>
              </Link>
            )}
            <Link href="/generator">
              <button className="px-3 sm:px-4 py-1.5 rounded-full bg-[#4d9fff] text-white text-[14px] font-medium hover:bg-[#6aaeff] transition-colors glow-blue whitespace-nowrap">
                Создать<span className="hidden sm:inline"> карточку</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
