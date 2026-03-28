import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Download, Copy, Check, Loader2, Users, Zap, Image, Plus, X, ChevronLeft, ChevronRight, Gift, TrendingUp, ExternalLink, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api, type GenerationItem, type BonusTransaction } from "@/lib/api";
import { cn } from "@/lib/utils";

const MARKETPLACE_LABELS: Record<string, string> = {
  wildberries: "Wildberries", ozon: "Ozon", yandex: "Яндекс Маркет", universal: "Универсальная",
};

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [raw]; }
  catch { return [raw]; }
}
function parseOutputText(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[15px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#4d9fff]/60 focus:ring-3 focus:ring-[#4d9fff]/15 transition-all";

function GenModal({ gen, onClose }: { gen: GenerationItem; onClose: () => void }) {
  const images = parseImageUrls(gen.outputImageUrl);
  const text = parseOutputText(gen.outputText);
  const [idx, setIdx] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[10px]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative glass-strong rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 glass-strong border-b border-white/[0.07] px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <div>
            <p className="font-semibold text-[16px] text-white/90">{gen.productName ?? "Без названия"}</p>
            <p className="text-[13px] text-white/40 mt-0.5">{MARKETPLACE_LABELS[gen.marketplace ?? ""] ?? "—"} · {formatDate(gen.createdAt)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center hover:bg-white/[0.14] transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {images.length > 0 && (
            <>
              <div className="relative rounded-2xl overflow-hidden bg-white/[0.04]">
                <img src={images[idx]} alt="" className="w-full object-contain max-h-72" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all disabled:opacity-0 disabled:pointer-events-none">
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => setIdx(i => Math.min(images.length - 1, i + 1))} disabled={idx === images.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all disabled:opacity-0 disabled:pointer-events-none">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setIdx(i)} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-5 bg-[#4d9fff]" : "w-1.5 bg-white/30")} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setIdx(i)} className={cn("flex-1 rounded-xl overflow-hidden border-2 aspect-square transition-all", i === idx ? "border-[#4d9fff]" : "border-white/10 hover:border-[#4d9fff]/40")}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <a href={images[idx]} download={`card-${gen.id}-v${idx + 1}.png`} target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-full bg-[#4d9fff] text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[#6aaeff] transition-colors">
                <Download className="w-4 h-4" /> Скачать{images.length > 1 ? ` вариант ${idx + 1}` : ""}
              </a>
            </>
          )}
          {[text.name && { l: "Название", v: text.name }, text.description && { l: "Описание", v: text.description }, text.characteristics && { l: "Характеристики", v: text.characteristics }, text.keywords && { l: "Ключевые слова", v: text.keywords }, text.seoTips && { l: "SEO-советы", v: text.seoTips }].filter(Boolean).map((item: any) => (
            <div key={item.l} className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
              <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">{item.l}</p>
              <p className="text-[14px] text-white/70 leading-relaxed whitespace-pre-wrap">{item.v}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, loading, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [bonusHistory, setBonusHistory] = useState<BonusTransaction[]>([]);
  const [gLoading, setGLoading] = useState(true);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [referralInput, setReferralInput] = useState("");
  const [referralMsg, setReferralMsg] = useState("");
  const [referralMsgOk, setReferralMsgOk] = useState(false);
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [selectedGen, setSelectedGen] = useState<GenerationItem | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "partner">("history");

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    api.user.get().then(data => {
      setGenerations(data.generations);
      setReferralCount(data.referralCount);
      setBonusHistory(data.bonusHistory ?? []);
    }).finally(() => setGLoading(false));
  }, [user]);

  const referralLink = user ? `${window.location.origin}/auth?ref=${user.referralCode}` : "";

  function copy(type: "code" | "link") {
    navigator.clipboard.writeText(type === "code" ? user!.referralCode : referralLink);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  async function applyReferral() {
    if (!referralInput.trim()) return;
    setApplyingReferral(true);
    setReferralMsg("");
    try {
      const res = await api.referral.apply(referralInput.trim());
      setReferralMsg(res.message);
      setReferralMsgOk(true);
      await refreshUser();
      setReferralInput("");
    } catch (err: any) {
      setReferralMsg(err.message);
      setReferralMsgOk(false);
    } finally {
      setApplyingReferral(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080810]">
        <Loader2 className="w-7 h-7 animate-spin text-[#4d9fff]" />
      </div>
    );
  }

  const totalBonusEarned = bonusHistory.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#080810]">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-[16px] text-white/80 tracking-[-0.01em]">CardMaker</Link>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-white/35 hidden sm:block">{user.email}</span>
            {user.isAdmin && (
              <Link href="/admin">
                <button className="px-3 py-1 rounded-full bg-[#4d9fff]/15 text-[#4d9fff] text-[13px] font-medium hover:bg-[#4d9fff]/25 transition-colors">Админ</button>
              </Link>
            )}
            <Link href="/generator">
              <button className="px-4 py-1.5 rounded-full bg-[#4d9fff] text-white text-[14px] font-medium hover:bg-[#6aaeff] transition-colors flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Создать
              </button>
            </Link>
            <button onClick={() => logout().then(() => navigate("/"))} className="p-2 rounded-full hover:bg-white/[0.07] text-white/35 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-[-0.025em]">Личный кабинет</h1>
          <p className="text-[15px] text-white/35 mt-1">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Zap className="w-4 h-4" />, iconColor: "#4d9fff", label: "Бесплатных", value: user.isAdmin ? "∞" : user.freeGenerations, valColor: "#4d9fff" },
            { icon: <Gift className="w-4 h-4" />, iconColor: "#bf5af2", label: "Бонусных", value: user.isAdmin ? "∞" : user.bonusGenerations, valColor: "#bf5af2" },
            { icon: <Image className="w-4 h-4" />, iconColor: "#30d158", label: "Карточек", value: generations.length, valColor: "#30d158" },
            { icon: <Users className="w-4 h-4" />, iconColor: "#ffd60a", label: "Партнёров", value: referralCount, valColor: "#ffd60a" },
          ].map(s => (
            <div key={s.label} className="glass rounded-3xl p-5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${s.iconColor}18`, color: s.iconColor }}>
                {s.icon}
              </div>
              <p className="text-[28px] font-bold tracking-[-0.02em]" style={{ color: s.valColor }}>{s.value}</p>
              <p className="text-[12px] text-white/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Infographics */}
        {!gLoading && (generations.length > 0 || referralCount > 0) && (
          <div className="glass rounded-3xl p-6">
            <h2 className="text-[15px] font-semibold text-white/90 mb-5">Ваша активность</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Cards infographic */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                    <circle
                      cx="40" cy="40" r="33" fill="none"
                      stroke="#30d158" strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(generations.length, 20) / 20 * 207} 207`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[18px] font-bold text-white">{generations.length}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-white/90">Карточки создані</p>
                  <p className="text-[13px] text-white/40 mt-0.5 leading-relaxed">
                    Вы создали <span className="text-[#30d158] font-semibold">{generations.length}</span> карточку товара
                    {generations.length >= 20 && " — уже 20+!"}
                  </p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {[5, 10, 20].map(milestone => (
                      <div key={milestone} className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full border-2 shrink-0", generations.length >= milestone ? "bg-[#30d158] border-[#30d158]" : "border-white/20")} />
                        <span className={cn("text-[12px]", generations.length >= milestone ? "text-[#30d158]" : "text-white/30")}>{milestone} карточек</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Partners infographic */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                    <circle
                      cx="40" cy="40" r="33" fill="none"
                      stroke="#bf5af2" strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(referralCount, 10) / 10 * 207} 207`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[18px] font-bold text-white">{referralCount}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-white/90">Партнёры</p>
                  <p className="text-[13px] text-white/40 mt-0.5 leading-relaxed">
                    Вы пригласили <span className="text-[#bf5af2] font-semibold">{referralCount}</span> {referralCount === 1 ? "друга" : referralCount < 5 ? "друга" : "друзей"}
                    {referralCount > 0 && <> и заработали <span className="text-[#bf5af2] font-semibold">+{bonusHistory.reduce((s, t) => s + t.amount, 0)}</span> бонусов</>}
                  </p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {[1, 3, 5].map(milestone => (
                      <div key={milestone} className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full border-2 shrink-0", referralCount >= milestone ? "bg-[#bf5af2] border-[#bf5af2]" : "border-white/20")} />
                        <span className={cn("text-[12px]", referralCount >= milestone ? "text-[#bf5af2]" : "text-white/30")}>{milestone} {milestone === 1 ? "партнёр" : "партнёра"} (+{milestone * 3} бонусов)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zero balance */}
        {!user.isAdmin && user.freeGenerations + user.bonusGenerations === 0 && (
          <div className="glass rounded-3xl p-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#ffd60a]/15 flex items-center justify-center shrink-0"><Zap className="w-4 h-4 text-[#ffd60a]" /></div>
            <div>
              <p className="text-[15px] font-semibold text-white/90">Генерации закончились</p>
              <p className="text-[13px] text-white/40 mt-0.5">Пригласите друга — получите <strong className="text-white/70">+3 бонусных генерации</strong> сразу.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex glass rounded-2xl p-1 w-fit">
          {([["history", "История карточек"], ["partner", "Партнёрская программа"]] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-xl text-[14px] font-medium transition-all",
                activeTab === tab ? "bg-[#4d9fff] text-white shadow-sm" : "text-white/40 hover:text-white/70"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* History */}
        {activeTab === "history" && (
          <div className="glass rounded-3xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white/90">История карточек</h2>
              <Link href="/generator">
                <button className="text-[14px] font-medium text-[#4d9fff] hover:text-[#7ec4ff] transition-colors flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Новая
                </button>
              </Link>
            </div>
            {gLoading ? (
              <div className="p-14 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#4d9fff]" /></div>
            ) : generations.length === 0 ? (
              <div className="p-14 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.04] flex items-center justify-center">
                  <Image className="w-7 h-7 text-white/20" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white/80">Пока нет карточек</p>
                  <p className="text-[13px] text-white/35 mt-0.5">Создайте первую карточку товара</p>
                </div>
                <Link href="/generator">
                  <button className="mt-2 px-5 py-2 rounded-full bg-[#4d9fff] text-white text-[14px] font-medium hover:bg-[#6aaeff] transition-colors">Создать карточку</button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {generations.slice().reverse().map(gen => {
                  const images = parseImageUrls(gen.outputImageUrl);
                  return (
                    <div key={gen.id} onClick={() => setSelectedGen(gen)} className="px-5 py-4 flex gap-4 items-center hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] overflow-hidden shrink-0 flex items-center justify-center relative">
                        {images.length > 0 ? (
                          <><img src={images[0]} alt="" className="w-full h-full object-cover" />{images.length > 1 && <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] font-bold rounded px-1 leading-4">+{images.length - 1}</div>}</>
                        ) : <Image className="w-5 h-5 text-white/20" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-white/85 truncate">{gen.productName ?? "Без названия"}</p>
                        <p className="text-[12px] text-white/35 mt-0.5">{MARKETPLACE_LABELS[gen.marketplace ?? ""] ?? "—"} · {formatDate(gen.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[12px] font-medium", gen.status === "done" ? "text-[#30d158]" : "text-[#ffd60a]")}>
                          {gen.status === "done" ? "Готово" : "Обработка"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Partner */}
        {activeTab === "partner" && (
          <div className="flex flex-col gap-4">
            <div className="glass rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-3xl bg-[#4d9fff]/15 border border-[#4d9fff]/20 flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-[#4d9fff]" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-white/90">Партнёрская программа</h2>
                  <p className="text-[14px] text-white/45 mt-1 leading-relaxed">
                    Пригласите друга — сразу получите <strong className="text-[#4d9fff]">+3 бонусные генерации</strong>.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { icon: <Users className="w-4 h-4" />, color: "#4d9fff", label: "Приглашено", val: referralCount },
                  { icon: <TrendingUp className="w-4 h-4" />, color: "#30d158", label: "Заработано бонусов", val: totalBonusEarned },
                  { icon: <Gift className="w-4 h-4" />, color: "#bf5af2", label: "Бонусы сейчас", val: user.isAdmin ? "∞" : user.bonusGenerations },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.04] rounded-2xl p-4 text-center border border-white/[0.06]">
                    <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                    <p className="text-[22px] font-bold text-white tracking-[-0.02em]">{s.val}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-3xl p-5">
                <h3 className="text-[15px] font-semibold text-white/90 mb-3">Реферальный код</h3>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] font-mono text-[22px] font-bold tracking-widest text-white/90 flex items-center justify-center">
                    {user.referralCode}
                  </div>
                  <button onClick={() => copy("code")} className="px-4 py-3 rounded-xl border border-white/[0.1] hover:bg-white/[0.07] transition-colors text-[13px] font-medium text-white/60 flex items-center gap-1.5 shrink-0">
                    {copied === "code" ? <Check className="w-4 h-4 text-[#30d158]" /> : <Copy className="w-4 h-4" />}
                    {copied === "code" ? "Скопировано" : "Копировать"}
                  </button>
                </div>
              </div>
              <div className="glass rounded-3xl p-5">
                <h3 className="text-[15px] font-semibold text-white/90 mb-3">Ссылка для приглашения</h3>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[12px] text-white/40 truncate flex items-center">
                    <ExternalLink className="w-3.5 h-3.5 mr-2 shrink-0 text-[#4d9fff]" />{referralLink}
                  </div>
                  <button onClick={() => copy("link")} className="px-4 py-3 rounded-xl border border-white/[0.1] hover:bg-white/[0.07] transition-colors text-[13px] font-medium text-white/60 flex items-center gap-1.5 shrink-0">
                    {copied === "link" ? <Check className="w-4 h-4 text-[#30d158]" /> : <Copy className="w-4 h-4" />}
                    {copied === "link" ? "Скопировано" : "Копировать"}
                  </button>
                </div>
                <p className="text-[12px] text-white/25 mt-2">Ссылка откроет регистрацию с вашим кодом</p>
              </div>
            </div>

            {referralCount === 0 && bonusHistory.length === 0 && (
              <div className="glass rounded-3xl p-5">
                <h3 className="text-[15px] font-semibold text-white/90 mb-1">Применить код партнёра</h3>
                <p className="text-[13px] text-white/40 mb-4">Если вас пригласил друг, введите его реферальный код</p>
                <div className="flex gap-2">
                  <input type="text" value={referralInput} onChange={e => setReferralInput(e.target.value.toUpperCase())} maxLength={6} placeholder="XXXXXX" className={cn(inputCls, "font-mono tracking-widest flex-1")} />
                  <button onClick={applyReferral} disabled={applyingReferral || !referralInput.trim()} className="px-4 py-2.5 rounded-full bg-[#4d9fff] text-white text-[14px] font-medium hover:bg-[#6aaeff] disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0">
                    {applyingReferral ? <Loader2 className="w-4 h-4 animate-spin" /> : "Применить"}
                  </button>
                </div>
                {referralMsg && <p className={cn("text-[12px] mt-2", referralMsgOk ? "text-[#30d158]" : "text-red-400")}>{referralMsg}</p>}
              </div>
            )}

            <div className="glass rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.07]">
                <h3 className="text-[15px] font-semibold text-white/90">История начислений</h3>
                <p className="text-[12px] text-white/30 mt-0.5">Бонусные генерации за приглашённых друзей</p>
              </div>
              {bonusHistory.length === 0 ? (
                <div className="p-12 flex flex-col items-center gap-2 text-center">
                  <Clock className="w-7 h-7 text-white/15" />
                  <p className="text-[14px] text-white/35">Начислений пока нет</p>
                  <p className="text-[12px] text-white/20">Пригласите первого друга по ссылке</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {bonusHistory.map(t => (
                    <div key={t.id} className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#bf5af2]/15 flex items-center justify-center"><Gift className="w-4 h-4 text-[#bf5af2]" /></div>
                        <div>
                          <p className="text-[14px] font-medium text-white/80">За приглашение друга</p>
                          <p className="text-[12px] text-white/35">{formatDate(t.createdAt)}</p>
                        </div>
                      </div>
                      <span className="text-[15px] font-bold text-[#bf5af2]">+{t.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedGen && <GenModal gen={selectedGen} onClose={() => setSelectedGen(null)} />}
      </AnimatePresence>
    </div>
  );
}
