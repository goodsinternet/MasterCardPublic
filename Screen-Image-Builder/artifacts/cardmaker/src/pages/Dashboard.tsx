import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Download, Copy, Check, Loader2, Users, Zap, Image, Plus, X, ChevronLeft, ChevronRight, Gift, TrendingUp, ExternalLink, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api, type GenerationItem, type BonusTransaction } from "@/lib/api";
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
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [raw];
  } catch { return [raw]; }
}

function parseOutputText(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15 bg-white transition-all";

function GenModal({ gen, onClose }: { gen: GenerationItem; onClose: () => void }) {
  const images = parseImageUrls(gen.outputImageUrl);
  const text = parseOutputText(gen.outputText);
  const [idx, setIdx] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[#e5e5ea] px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <div>
            <p className="font-semibold text-[16px] text-[#1d1d1f]">{gen.productName ?? "Без названия"}</p>
            <p className="text-[13px] text-[#6e6e73] mt-0.5">
              {MARKETPLACE_LABELS[gen.marketplace ?? ""] ?? "—"} · {formatDate(gen.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#e8e8ed] transition-colors">
            <X className="w-4 h-4 text-[#6e6e73]" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {images.length > 0 && (
            <>
              <div className="relative rounded-2xl overflow-hidden bg-[#f5f5f7]">
                <img src={images[idx]} alt="" className="w-full object-contain max-h-72" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all disabled:opacity-0 disabled:pointer-events-none">
                      <ChevronLeft className="w-5 h-5 text-[#1d1d1f]" />
                    </button>
                    <button onClick={() => setIdx(i => Math.min(images.length - 1, i + 1))} disabled={idx === images.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all disabled:opacity-0 disabled:pointer-events-none">
                      <ChevronRight className="w-5 h-5 text-[#1d1d1f]" />
                    </button>
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setIdx(i)} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-5 bg-[#0071e3]" : "w-1.5 bg-black/20")} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setIdx(i)} className={cn("flex-1 rounded-xl overflow-hidden border-2 aspect-square transition-all", i === idx ? "border-[#0071e3]" : "border-[#e5e5ea] hover:border-[#0071e3]/40")}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <a href={images[idx]} download={`card-${gen.id}-v${idx + 1}.png`} target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-full bg-[#0071e3] text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[#0077ed] transition-colors">
                <Download className="w-4 h-4" />
                Скачать{images.length > 1 ? ` вариант ${idx + 1}` : " изображение"}
              </a>
            </>
          )}

          {[
            text.name && { label: "Название", val: text.name },
            text.description && { label: "Описание", val: text.description },
            text.characteristics && { label: "Характеристики", val: text.characteristics },
            text.keywords && { label: "Ключевые слова", val: text.keywords },
            text.seoTips && { label: "SEO-советы", val: text.seoTips },
          ].filter(Boolean).map((item: any) => (
            <div key={item.label} className="bg-[#f9f9fb] rounded-2xl p-4 border border-[#e5e5ea]">
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-1.5">{item.label}</p>
              <p className="text-[14px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">{item.val}</p>
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

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <Loader2 className="w-7 h-7 animate-spin text-[#0071e3]" />
      </div>
    );
  }

  const totalBonusEarned = bonusHistory.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="glass-nav border-b border-black/[0.08] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <Link href="/" className="font-semibold text-[17px] text-[#1d1d1f] tracking-[-0.01em]">CardMaker</Link>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#6e6e73] hidden sm:block">{user.email}</span>
            {user.isAdmin && (
              <Link href="/admin">
                <button className="px-3 py-1 rounded-full bg-[#f0f0ff] text-[#5e5ce6] text-[13px] font-medium hover:bg-[#e5e5ff] transition-colors">Админ</button>
              </Link>
            )}
            <Link href="/generator">
              <button className="px-4 py-1.5 rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] transition-colors flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Создать
              </button>
            </Link>
            <button onClick={() => logout().then(() => navigate("/"))} className="p-2 rounded-full hover:bg-[#e8e8ed] text-[#6e6e73] transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">Личный кабинет</h1>
          <p className="text-[15px] text-[#6e6e73] mt-1">{user.email}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Zap className="w-4 h-4" />, iconBg: "#f0f6ff", iconColor: "#0071e3", label: "Бесплатных", value: user.isAdmin ? "∞" : user.freeGenerations, valueColor: "#0071e3" },
            { icon: <Gift className="w-4 h-4" />, iconBg: "#fdf0ff", iconColor: "#bf5af2", label: "Бонусных", value: user.isAdmin ? "∞" : user.bonusGenerations, valueColor: "#bf5af2" },
            { icon: <Image className="w-4 h-4" />, iconBg: "#f0faf3", iconColor: "#30d158", label: "Карточек", value: generations.length, valueColor: "#1d1d1f" },
            { icon: <Users className="w-4 h-4" />, iconBg: "#fff8ed", iconColor: "#ff9f0a", label: "Друзей", value: referralCount, valueColor: "#1d1d1f" },
          ].map(s => (
            <div key={s.label} className="apple-card p-5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3" style={{ background: s.iconBg, color: s.iconColor }}>
                {s.icon}
              </div>
              <p className="text-[28px] font-bold tracking-[-0.02em]" style={{ color: s.valueColor }}>{s.value}</p>
              <p className="text-[12px] text-[#6e6e73] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Zero balance nudge */}
        {!user.isAdmin && user.freeGenerations + user.bonusGenerations === 0 && (
          <div className="apple-card p-5 flex items-start gap-3 border-[#ff9f0a]/30">
            <div className="w-9 h-9 rounded-2xl bg-[#fff8ed] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#ff9f0a]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1d1d1f]">Генерации закончились</p>
              <p className="text-[13px] text-[#6e6e73] mt-0.5">Пригласите друга — вы сразу получите <strong>+3 бонусных генерации</strong>.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-[#e5e5ea] p-1 shadow-[0_1px_4px_rgba(0,0,0,0.04)] w-fit">
          {([["history", "История карточек"], ["partner", "Партнёрская программа"]] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-xl text-[14px] font-medium transition-all",
                activeTab === tab ? "bg-[#0071e3] text-white shadow-sm" : "text-[#6e6e73] hover:text-[#1d1d1f]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* History tab */}
        {activeTab === "history" && (
          <div className="apple-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5ea] flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#1d1d1f]">История карточек</h2>
              <Link href="/generator">
                <button className="text-[14px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Новая
                </button>
              </Link>
            </div>

            {gLoading ? (
              <div className="p-14 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#0071e3]" /></div>
            ) : generations.length === 0 ? (
              <div className="p-14 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-3xl bg-[#f5f5f7] flex items-center justify-center">
                  <Image className="w-7 h-7 text-[#aeaeb2]" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">Пока нет карточек</p>
                  <p className="text-[13px] text-[#6e6e73] mt-0.5">Создайте первую карточку товара</p>
                </div>
                <Link href="/generator">
                  <button className="mt-2 px-5 py-2 rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] transition-colors">
                    Создать карточку
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#f5f5f7]">
                {generations.slice().reverse().map(gen => {
                  const images = parseImageUrls(gen.outputImageUrl);
                  return (
                    <div key={gen.id} onClick={() => setSelectedGen(gen)} className="px-5 py-4 flex gap-4 items-center hover:bg-[#f9f9fb] transition-colors cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] overflow-hidden shrink-0 flex items-center justify-center relative">
                        {images.length > 0 ? (
                          <>
                            <img src={images[0]} alt="" className="w-full h-full object-cover" />
                            {images.length > 1 && <div className="absolute bottom-0.5 right-0.5 bg-black/55 text-white text-[9px] font-bold rounded px-1 leading-4">+{images.length - 1}</div>}
                          </>
                        ) : <Image className="w-5 h-5 text-[#aeaeb2]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">{gen.productName ?? "Без названия"}</p>
                        <p className="text-[12px] text-[#6e6e73] mt-0.5">
                          {MARKETPLACE_LABELS[gen.marketplace ?? ""] ?? "—"} · {formatDate(gen.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[12px] font-medium", gen.status === "done" ? "text-[#30d158]" : "text-[#ff9f0a]")}>
                          {gen.status === "done" ? "Готово" : "Обработка"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#aeaeb2]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Partner tab */}
        {activeTab === "partner" && (
          <div className="flex flex-col gap-4">
            {/* Banner */}
            <div className="apple-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-3xl bg-[#f0f6ff] flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-[#0071e3]" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-[#1d1d1f]">Партнёрская программа</h2>
                  <p className="text-[14px] text-[#6e6e73] mt-1 leading-relaxed">
                    Пригласите друга по ссылке — вы сразу получите <strong className="text-[#0071e3]">+3 бонусные генерации</strong> без ограничений.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { icon: <Users className="w-4 h-4" />, label: "Приглашено", value: referralCount, color: "#0071e3" },
                  { icon: <TrendingUp className="w-4 h-4" />, label: "Заработано бонусов", value: totalBonusEarned, color: "#30d158" },
                  { icon: <Gift className="w-4 h-4" />, label: "Бонусы сейчас", value: user.isAdmin ? "∞" : user.bonusGenerations, color: "#bf5af2" },
                ].map(s => (
                  <div key={s.label} className="bg-[#f9f9fb] rounded-2xl p-4 text-center border border-[#e5e5ea]">
                    <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                    <p className="text-[22px] font-bold text-[#1d1d1f] tracking-[-0.02em]">{s.value}</p>
                    <p className="text-[11px] text-[#6e6e73] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Code & link */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="apple-card p-5">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">Реферальный код</h3>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] font-mono text-[22px] font-bold tracking-widest text-[#1d1d1f] flex items-center justify-center">
                    {user.referralCode}
                  </div>
                  <button onClick={() => copy("code")} className="px-4 py-3 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors text-[13px] font-medium text-[#1d1d1f] flex items-center gap-1.5 shrink-0">
                    {copied === "code" ? <Check className="w-4 h-4 text-[#30d158]" /> : <Copy className="w-4 h-4" />}
                    {copied === "code" ? "Скопировано" : "Копировать"}
                  </button>
                </div>
              </div>

              <div className="apple-card p-5">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">Ссылка для приглашения</h3>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] text-[12px] text-[#6e6e73] truncate flex items-center">
                    <ExternalLink className="w-3.5 h-3.5 mr-2 shrink-0 text-[#0071e3]" />
                    {referralLink}
                  </div>
                  <button onClick={() => copy("link")} className="px-4 py-3 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors text-[13px] font-medium text-[#1d1d1f] flex items-center gap-1.5 shrink-0">
                    {copied === "link" ? <Check className="w-4 h-4 text-[#30d158]" /> : <Copy className="w-4 h-4" />}
                    {copied === "link" ? "Скопировано" : "Копировать"}
                  </button>
                </div>
                <p className="text-[12px] text-[#6e6e73] mt-2">Ссылка откроет регистрацию с вашим кодом</p>
              </div>
            </div>

            {/* Apply code */}
            {referralCount === 0 && bonusHistory.length === 0 && (
              <div className="apple-card p-5">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">Применить код партнёра</h3>
                <p className="text-[13px] text-[#6e6e73] mb-4">Если вас пригласил друг, введите его реферальный код</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralInput}
                    onChange={e => setReferralInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="XXXXXX"
                    className={cn(inputCls, "font-mono tracking-widest flex-1")}
                  />
                  <button
                    onClick={applyReferral}
                    disabled={applyingReferral || !referralInput.trim()}
                    className="px-4 py-2.5 rounded-full bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0"
                  >
                    {applyingReferral ? <Loader2 className="w-4 h-4 animate-spin" /> : "Применить"}
                  </button>
                </div>
                {referralMsg && (
                  <p className={cn("text-[12px] mt-2", referralMsgOk ? "text-[#30d158]" : "text-red-500")}>{referralMsg}</p>
                )}
              </div>
            )}

            {/* Bonus history */}
            <div className="apple-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e5ea]">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">История начислений</h3>
                <p className="text-[12px] text-[#6e6e73] mt-0.5">Бонусные генерации за приглашённых друзей</p>
              </div>
              {bonusHistory.length === 0 ? (
                <div className="p-12 flex flex-col items-center gap-2 text-center">
                  <Clock className="w-7 h-7 text-[#aeaeb2]" />
                  <p className="text-[14px] text-[#6e6e73]">Начислений пока нет</p>
                  <p className="text-[12px] text-[#aeaeb2]">Пригласите первого друга по ссылке</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f5f5f7]">
                  {bonusHistory.map(t => (
                    <div key={t.id} className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#fdf0ff] flex items-center justify-center">
                          <Gift className="w-4 h-4 text-[#bf5af2]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#1d1d1f]">За приглашение друга</p>
                          <p className="text-[12px] text-[#6e6e73]">{formatDate(t.createdAt)}</p>
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
