import { Link } from "wouter";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-lg border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Star className="w-6 h-6 fill-white/20" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              CardMaker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/generator" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Генератор
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Партнёрка
            </Link>
            {user?.isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors">
                Админ панель
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="hidden sm:inline-flex">Кабинет</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="hidden sm:inline-flex">Войти</Button>
              </Link>
            )}
            <Link href="/generator">
              <Button>Создать карточку</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
