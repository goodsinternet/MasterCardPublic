import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-black/[0.08]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[52px]">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#0071e3] flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M10 2L3 7v11h4v-6h6v6h4V7L10 2z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="font-semibold text-[17px] text-[#1d1d1f] tracking-[-0.01em]">CardMaker</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link href="/generator" className="text-[14px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
              Генератор
            </Link>
            <Link href="/dashboard" className="text-[14px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
              Партнёрка
            </Link>
            {user?.isAdmin && (
              <Link href="/admin" className="text-[14px] text-[#0071e3] hover:text-[#0077ed] transition-colors">
                Админ
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <button className="text-[14px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors">
                  Кабинет
                </button>
              </Link>
            ) : (
              <Link href="/auth">
                <button className="text-[14px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors">
                  Войти
                </button>
              </Link>
            )}
            <Link href="/generator">
              <button className="px-4 py-1.5 rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] transition-colors shadow-sm">
                Создать карточку
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
