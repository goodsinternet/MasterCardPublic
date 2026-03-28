import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Star, LogOut, Download, Copy, Check, Loader2, Users, Zap, Image, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api, type GenerationItem } from "@/lib/api";
import { cn } from "@/lib/utils";

const MARKETPLACE_LABELS: Record<string, string> = {
  wildberries: "Wildberries",
  ozon: "Ozon",
  yandex: "Яндекс Маркет",
  universal: "Универсальная",
};

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [raw];
  } catch {
    return [raw];
  }
}

function parseOutputText(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

interface GenModalProps {
  gen: GenerationItem;
  onClose: () => void;
}

function GenModal({ gen, onClose }: GenModalProps) {
  const images = parseImageUrls(gen.outputImageUrl);
  const text = parseOutputText(gen.outputText);
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-border/30 p-5 flex items-center justify-between z-10">
          <div>
            <p className="font-bold text-base">{gen.productName ?? "Без названия"}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{MARKETPLACE_LABELS[gen.marketplace ?? ""] ?? gen.marketplace ?? "—"}</span>
              {gen.price && <><span className="text-muted-foreground/40 text-xs">·</span><span className="text-xs text-muted-foreground">{gen.price} ₽</span></>}
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground">{new Date(gen.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {images.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="relative rounded-xl overflow-hidden bg-secondary/20 border border-border/30">
                <img src={images[imgIdx]} alt={`Изображение ${imgIdx + 1}`} className="w-full object-contain max-h-72" />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                      disabled={imgIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                      disabled={imgIdx === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)} className={cn("w-2 h-2 rounded-full transition-all", i === imgIdx ? "bg-primary" : "bg-white/60")} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={cn("flex-1 rounded-lg overflow-hidden border-2 aspect-square transition-all", i === imgIdx ? "border-primary" : "border-border/30 hover:border-primary/50")}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <a
                href={images[imgIdx]}
                download={`card-${gen.id}-v${imgIdx + 1}.png`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Скачать{images.length > 1 ? ` вариант ${imgIdx + 1}` : " изображение"}
              </a>
            </div>
          )}

          {text.name && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Название</p>
              <p className="text-sm font-medium">{text.name}</p>
            </div>
          )}

          {text.description && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Описание</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{text.description}</p>
            </div>
          )}

          {text.characteristics && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Характеристики</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{text.characteristics}</p>
            </div>
          )}

          {text.keywords && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ключевые слова</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{text.keywords}</p>
            </div>
          )}

          {text.category && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Категория</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{text.category}</span>
            </div>
          )}

          {text.seoTips && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">SEO-советы</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{text.seoTips}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

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
  const [selectedGen, setSelectedGen] = useState<GenerationItem | null>(null);
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
              {generations.slice().reverse().map(gen => {
                const images = parseImageUrls(gen.outputImageUrl);
                return (
                  <div
                    key={gen.id}
                    onClick={() => setSelectedGen(gen)}
                    className="p-4 flex gap-4 items-start hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-xl bg-secondary/40 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {images.length > 0 ? (
                        <>
                          <img src={images[0]} alt="" className="w-full h-full object-cover" />
                          {images.length > 1 && (
                            <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[10px] font-bold rounded px-1 leading-4">
                              +{images.length - 1}
                            </div>
                          )}
                        </>
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
                    <div className="text-xs text-primary font-medium shrink-0 mt-1">Открыть →</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedGen && <GenModal gen={selectedGen} onClose={() => setSelectedGen(null)} />}
      </AnimatePresence>
    </div>
  );
}
