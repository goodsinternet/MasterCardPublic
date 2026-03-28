import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Star, LogOut, Download, Copy, Check, Loader2, Users, Zap, Image, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api, type GenerationItem } from "@/lib/api";
import { cn } from "@/lib/utils";

const MARKETPLACE_LABELS: Record<string, string> = {
  wildberries: "Wildberries",
  ozon: "Ozon",
  yandex: "Яндекс Маркет",
  universal: "Универсальная",
};

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const [, navigate] = useLocation();
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [gLoading, setGLoading] = useState(true);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralMsg, setReferralMsg] = useState("");
  const [applyingReferral, setApplyingReferral] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    api.user.get().then(data => {
      setGenerations(data.generations);
      setReferralCount(data.referralCount);
    }).finally(() => setGLoading(false));
  }, [user]);

  function copyReferralCode() {
    if (!user) return;
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  async function applyReferral() {
    if (!referralInput.trim()) return;
    setApplyingReferral(true);
    setReferralMsg("");
    try {
      const res = await api.referral.apply(referralInput.trim());
      setReferralMsg(res.message);
      await refreshUser();
      setReferralInput("");
    } catch (err: any) {
      setReferralMsg(err.message);
    } finally {
      setApplyingReferral(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <header className="bg-white border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white">
              <Star className="w-4 h-4 fill-white/20" />
            </div>
            <span className="font-bold text-lg tracking-tight">CardMaker</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Link href="/generator">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Создать
              </button>
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Личный кабинет</h1>
          <p className="text-sm text-muted-foreground mt-1">Управляйте карточками и балансом</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Генерации</span>
            </div>
            <p className="text-3xl font-bold text-primary">{user.bonusGenerations}</p>
            <p className="text-xs text-muted-foreground mt-0.5">доступно</p>
          </div>

          <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                <Image className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-muted-foreground">Карточек</span>
            </div>
            <p className="text-3xl font-bold">{generations.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">создано</p>
          </div>

          <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground">Рефералы</span>
            </div>
            <p className="text-3xl font-bold">{referralCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">приглашено</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Referral Code */}
          <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
            <h2 className="font-semibold mb-1">Партнёрская программа</h2>
            <p className="text-sm text-muted-foreground mb-4">Приглашайте друзей — получайте +1 генерацию за каждого</p>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ваш реферальный код</label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/30 font-mono text-lg font-bold tracking-widest text-foreground flex items-center">
                {user.referralCode}
              </div>
              <button
                onClick={copyReferralCode}
                className="px-4 py-2.5 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
          </div>

          {/* Apply Referral */}
          <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
            <h2 className="font-semibold mb-1">Применить чужой код</h2>
            <p className="text-sm text-muted-foreground mb-4">Введите реферальный код друга и получите +2 генерации</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralInput}
                onChange={e => setReferralInput(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="XXXXXX"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              />
              <button
                onClick={applyReferral}
                disabled={applyingReferral || !referralInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {applyingReferral ? <Loader2 className="w-4 h-4 animate-spin" /> : "Применить"}
              </button>
            </div>
            {referralMsg && (
              <p className={cn("text-xs mt-2", referralMsg.includes("применён") ? "text-green-600" : "text-destructive")}>
                {referralMsg}
              </p>
            )}
          </div>
        </div>

        {/* Generations History */}
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm">
          <div className="p-5 border-b border-border/30 flex items-center justify-between">
            <h2 className="font-semibold">История карточек</h2>
            <Link href="/generator">
              <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Новая карточка
              </button>
            </Link>
          </div>

          {gLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : generations.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-medium">Пока нет карточек</p>
                <p className="text-sm text-muted-foreground mt-1">Создайте первую карточку товара</p>
              </div>
              <Link href="/generator">
                <button className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors mt-2">
                  Создать карточку
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {generations.slice().reverse().map(gen => (
                <div key={gen.id} className="p-4 flex gap-4 items-start hover:bg-secondary/20 transition-colors">
                  <div className="w-16 h-16 rounded-xl bg-secondary/40 overflow-hidden shrink-0 flex items-center justify-center">
                    {gen.outputImageUrl ? (
                      <img src={gen.outputImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{gen.productName ?? "Без названия"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {MARKETPLACE_LABELS[gen.marketplace ?? ""] ?? gen.marketplace ?? "—"}
                      </span>
                      {gen.price && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-xs text-muted-foreground">{gen.price} ₽</span>
                        </>
                      )}
                      <span className="text-muted-foreground/40">·</span>
                      <span className={cn("text-xs font-medium", gen.status === "done" ? "text-green-600" : "text-orange-500")}>
                        {gen.status === "done" ? "Готово" : "Обработка"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(gen.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {gen.outputImageUrl && (
                    <a
                      href={gen.outputImageUrl}
                      download={`card-${gen.id}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground transition-colors shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
