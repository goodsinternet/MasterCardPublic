import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, Loader2, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function PaymentSuccess() {
  const { refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      try { await refreshUser(); } finally { setRefreshing(false); }
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#30d158]/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-[#30d158]" />
        </div>
        <h1 className="text-[22px] font-bold text-white mb-2">Оплата прошла!</h1>
        <p className="text-[14px] text-white/45 leading-relaxed mb-6">
          Генерации добавлены на ваш счёт. Можете создавать карточки прямо сейчас.
        </p>
        {refreshing ? (
          <div className="flex items-center justify-center gap-2 text-white/40 text-[14px] mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Обновляем баланс…
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
          <Link href="/generator">
            <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#4d9fff] text-white text-[15px] font-semibold hover:bg-[#6aaeff] transition-colors">
              <Zap className="w-4 h-4" /> Создать карточку
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full px-5 py-3 rounded-2xl bg-white/[0.06] text-white/70 text-[15px] font-medium hover:bg-white/[0.09] transition-colors">
              Личный кабинет
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
