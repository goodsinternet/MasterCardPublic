import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Users, LayoutGrid, GitBranch, BarChart3, RefreshCw, ChevronLeft, Loader2, Shield, TrendingUp, CheckCircle2, Clock, Zap, Gift, Star, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AdminUser = {
  id: number; email: string; isAdmin: boolean;
  freeGenerations: number; bonusGenerations: number;
  referralCode: string; referrerId: number | null;
  createdAt: string; generationCount: number; referralCount: number;
};
type AdminGeneration = {
  id: number; userId: number; marketplace: string | null;
  productName: string | null; price: string | null; status: string; createdAt: string;
};
type Stats = {
  totalUsers: number; totalGenerations: number; doneGenerations: number;
  pendingGenerations: number; totalReferrals: number; newUsersToday: number;
  newUsersWeek: number; avgGenerationsPerUser: number; successRate: number;
  marketplaceStats: Array<{ marketplace: string; count: number }>;
};

const MARKETPLACE_LABELS: Record<string, string> = {
  wildberries: "Wildberries", ozon: "Ozon", yandex: "Яндекс Маркет", universal: "Универсальный",
};
const MARKETPLACE_COLORS: Record<string, string> = {
  wildberries: "#cb11ab", ozon: "#005bff", yandex: "#ffcc00", universal: "#4d9fff",
};

type Section = "overview" | "users" | "generations" | "referrals";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ icon, label, value, sub, color = "#4d9fff" }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <p className="text-[28px] font-bold text-white tracking-[-0.03em]">{value}</p>
      <p className="text-[13px] text-white/50 mt-0.5">{label}</p>
      {sub && <p className="text-[12px] mt-2 font-medium" style={{ color }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[12px] text-white/40 w-8 text-right">{value}</span>
    </div>
  );
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [generations, setGenerations] = useState<AdminGeneration[]>([]);
  const [section, setSection] = useState<Section>("overview");
  const [editingUser, setEditingUser] = useState<{ id: number; value: string } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (!loading && (!user || !user.isAdmin)) navigate("/"); }, [user, loading]);
  useEffect(() => { if (user?.isAdmin) loadAll(); }, [user]);

  async function loadAll(silent = false) {
    if (!silent) setDataLoading(true); else setRefreshing(true);
    try {
      const [statsData, usersData, gensData] = await Promise.all([
        api.admin.stats(), api.admin.users(), api.admin.generations(),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setGenerations(gensData.generations);
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
    } finally {
      setDataLoading(false); setRefreshing(false);
    }
  }

  async function handleUpdateGenerations(userId: number) {
    if (!editingUser || editingUser.id !== userId) return;
    const val = Number(editingUser.value);
    if (isNaN(val) || val < 0) { toast({ title: "Введите корректное число", variant: "destructive" }); return; }
    try {
      await api.admin.updateGenerations(userId, val);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, bonusGenerations: val } : u));
      setEditingUser(null);
      toast({ title: "Генерации обновлены" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  }

  if (loading || !user?.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-[#080810]"><Loader2 className="w-6 h-6 animate-spin text-[#4d9fff]" /></div>;
  }

  const navItems: { id: Section; icon: React.ReactNode; label: string; count?: number }[] = [
    { id: "overview", icon: <BarChart3 className="w-4 h-4" />, label: "Обзор" },
    { id: "users", icon: <Users className="w-4 h-4" />, label: "Пользователи", count: users.length },
    { id: "generations", icon: <LayoutGrid className="w-4 h-4" />, label: "Генерации", count: generations.length },
    { id: "referrals", icon: <GitBranch className="w-4 h-4" />, label: "Рефералы", count: stats?.totalReferrals },
  ];

  const topUsers = [...users].sort((a, b) => b.generationCount - a.generationCount).slice(0, 5);
  const topReferrers = [...users].sort((a, b) => b.referralCount - a.referralCount).filter(u => u.referralCount > 0).slice(0, 5);
  const maxGen = topUsers[0]?.generationCount ?? 1;
  const maxRef = topReferrers[0]?.referralCount ?? 1;

  return (
    <div className="min-h-screen bg-[#080810] md:flex">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-64 shrink-0 glass-nav border-r border-white/[0.07] flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4d9fff] to-[#1a6fdf] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[15px] text-white/90">Админ панель</span>
          </div>
          <p className="text-[12px] text-white/30 mt-1 ml-10">{user.email}</p>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left",
                section === item.id
                  ? "bg-[#4d9fff]/15 text-[#4d9fff]"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
              )}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              {item.count !== undefined && (
                <span className={cn("text-[12px] px-1.5 py-0.5 rounded-md", section === item.id ? "bg-[#4d9fff]/20 text-[#4d9fff]" : "bg-white/[0.07] text-white/35")}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.07] flex flex-col gap-2">
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Обновить данные
          </button>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all w-full">
              <ChevronLeft className="w-3.5 h-3.5" />
              Назад в кабинет
            </button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile nav — hidden on desktop */}
        <div className="md:hidden glass-nav border-b border-white/[0.07] sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4d9fff] to-[#1a6fdf] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-[14px] text-white/90">Админ панель</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => loadAll(true)} disabled={refreshing} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              </button>
              <Link href="/dashboard">
                <button className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
          <div className="flex overflow-x-auto px-3 pb-2 gap-1 scrollbar-none">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all shrink-0",
                  section === item.id
                    ? "bg-[#4d9fff]/15 text-[#4d9fff]"
                    : "text-white/45 hover:text-white/70 hover:bg-white/[0.05]"
                )}
              >
                {item.icon}
                {item.label}
                {item.count !== undefined && (
                  <span className={cn("text-[11px] px-1.5 py-0.5 rounded-md ml-0.5", section === item.id ? "bg-[#4d9fff]/20 text-[#4d9fff]" : "bg-white/[0.07] text-white/35")}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-8">
        {dataLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#4d9fff]" /></div>
        ) : (
          <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

            {/* ---- OVERVIEW ---- */}
            {section === "overview" && stats && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-[24px] font-bold text-white tracking-[-0.025em]">Обзор платформы</h1>
                  <p className="text-[14px] text-white/35 mt-1">Общая статистика по всем пользователям</p>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={<Users className="w-5 h-5" />} label="Пользователей" value={stats.totalUsers} sub={`+${stats.newUsersToday} сегодня`} color="#4d9fff" />
                  <StatCard icon={<LayoutGrid className="w-5 h-5" />} label="Всего генераций" value={stats.totalGenerations} sub={`~${stats.avgGenerationsPerUser} на польз.`} color="#30d158" />
                  <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Успешных" value={stats.doneGenerations} sub={`${stats.successRate}% успеха`} color="#ffd60a" />
                  <StatCard icon={<GitBranch className="w-5 h-5" />} label="Рефералов" value={stats.totalReferrals} color="#bf5af2" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Новых за неделю" value={stats.newUsersWeek} color="#ff9f0a" />
                  <StatCard icon={<Clock className="w-5 h-5" />} label="В обработке" value={stats.pendingGenerations} color="#ff453a" />
                  <StatCard icon={<Activity className="w-5 h-5" />} label="Успешность" value={`${stats.successRate}%`} color="#30d158" />
                  <StatCard icon={<Star className="w-5 h-5" />} label="Ср. карточек/польз." value={stats.avgGenerationsPerUser} color="#4d9fff" />
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Marketplace distribution */}
                  <div className="glass rounded-3xl p-5 lg:col-span-1">
                    <h2 className="text-[15px] font-semibold text-white/90 mb-4">Маркетплейсы</h2>
                    <div className="flex flex-col gap-3">
                      {(stats.marketplaceStats?.length ?? 0) === 0
                        ? <p className="text-[13px] text-white/30">Нет данных</p>
                        : stats.marketplaceStats!.map(m => (
                          <div key={m.marketplace}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] text-white/70">{MARKETPLACE_LABELS[m.marketplace] ?? m.marketplace}</span>
                            </div>
                            <MiniBar value={m.count} max={stats.doneGenerations || 1} color={MARKETPLACE_COLORS[m.marketplace] ?? "#4d9fff"} />
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Top users by cards */}
                  <div className="glass rounded-3xl p-5">
                    <h2 className="text-[15px] font-semibold text-white/90 mb-4">Топ по карточкам</h2>
                    <div className="flex flex-col gap-3">
                      {topUsers.map((u, i) => (
                        <div key={u.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px] text-white/60 truncate max-w-[160px]">
                              <span className="text-white/30 mr-1.5">#{i + 1}</span>{u.email}
                            </span>
                          </div>
                          <MiniBar value={u.generationCount} max={maxGen} color="#4d9fff" />
                        </div>
                      ))}
                      {topUsers.length === 0 && <p className="text-[13px] text-white/30">Нет данных</p>}
                    </div>
                  </div>

                  {/* Top referrers */}
                  <div className="glass rounded-3xl p-5">
                    <h2 className="text-[15px] font-semibold text-white/90 mb-4">Топ рефереров</h2>
                    <div className="flex flex-col gap-3">
                      {topReferrers.map((u, i) => (
                        <div key={u.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px] text-white/60 truncate max-w-[160px]">
                              <span className="text-white/30 mr-1.5">#{i + 1}</span>{u.email}
                            </span>
                          </div>
                          <MiniBar value={u.referralCount} max={maxRef} color="#bf5af2" />
                        </div>
                      ))}
                      {topReferrers.length === 0 && <p className="text-[13px] text-white/30">Пока нет рефералов</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---- USERS ---- */}
            {section === "users" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-[24px] font-bold text-white tracking-[-0.025em]">Пользователи</h1>
                  <p className="text-[14px] text-white/35 mt-1">Все зарегистрированные аккаунты</p>
                </div>
                <div className="glass rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-white/35 text-[11px] uppercase tracking-wider">
                        {["ID", "Email", "Роль", "Своб.", "Бонус", "Карточек", "Рефералов", "Код", "Регистрация", "Действия"].map(h => (
                          <th key={h} className="text-left px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-white/35">{u.id}</td>
                          <td className="px-4 py-3 text-white/80 font-medium max-w-[180px] truncate">{u.email}</td>
                          <td className="px-4 py-3">
                            {u.isAdmin
                              ? <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#4d9fff]/15 text-[#4d9fff] border border-[#4d9fff]/20">Админ</span>
                              : <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/[0.06] text-white/40">Польз.</span>}
                          </td>
                          <td className="px-4 py-3 text-white/60">{u.isAdmin ? "∞" : u.freeGenerations}</td>
                          <td className="px-4 py-3">
                            {editingUser?.id === u.id ? (
                              <div className="flex items-center gap-1.5">
                                <input type="number" value={editingUser.value} onChange={e => setEditingUser({ id: u.id, value: e.target.value })} className="w-16 px-2 py-1 bg-white/[0.07] border border-white/[0.15] rounded-lg text-white text-[13px] focus:outline-none focus:border-[#4d9fff]/60" min={0} autoFocus />
                                <button onClick={() => handleUpdateGenerations(u.id)} className="px-2 py-1 text-[11px] bg-[#4d9fff] hover:bg-[#6aaeff] rounded-lg text-white transition-colors">✓</button>
                                <button onClick={() => setEditingUser(null)} className="px-2 py-1 text-[11px] bg-white/[0.07] hover:bg-white/[0.12] rounded-lg text-white/60 transition-colors">✗</button>
                              </div>
                            ) : (
                              <span className={u.isAdmin ? "text-[#4d9fff]" : u.bonusGenerations === 0 ? "text-red-400" : "text-[#30d158]"}>
                                {u.isAdmin ? "∞" : u.bonusGenerations}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white/60">{u.generationCount}</td>
                          <td className="px-4 py-3">
                            <span className={u.referralCount > 0 ? "text-[#bf5af2]" : "text-white/30"}>{u.referralCount}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-white/35">{u.referralCode}</td>
                          <td className="px-4 py-3 text-white/35 text-[12px]">{formatDate(u.createdAt)}</td>
                          <td className="px-4 py-3">
                            {!u.isAdmin && editingUser?.id !== u.id && (
                              <button onClick={() => setEditingUser({ id: u.id, value: String(u.bonusGenerations) })} className="text-[12px] text-[#4d9fff] hover:text-[#7ec4ff] transition-colors whitespace-nowrap">
                                Изм. бонус
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---- GENERATIONS ---- */}
            {section === "generations" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-[24px] font-bold text-white tracking-[-0.025em]">Генерации</h1>
                  <p className="text-[14px] text-white/35 mt-1">Последние {generations.length} генераций</p>
                </div>
                <div className="glass rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[550px]">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-white/35 text-[11px] uppercase tracking-wider">
                        {["ID", "User ID", "Маркетплейс", "Товар", "Цена", "Статус", "Дата"].map(h => (
                          <th key={h} className="text-left px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generations.map(g => (
                        <tr key={g.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-white/35">{g.id}</td>
                          <td className="px-4 py-3 text-white/35">{g.userId}</td>
                          <td className="px-4 py-3 text-white/70">{MARKETPLACE_LABELS[g.marketplace ?? ""] ?? g.marketplace ?? "—"}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-white/60" title={g.productName ?? ""}>{g.productName ?? "—"}</td>
                          <td className="px-4 py-3 text-white/40">{g.price ? `${g.price} ₽` : "—"}</td>
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-0.5 text-[11px] rounded-full border",
                              g.status === "done" ? "bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20"
                                : g.status === "processing" ? "bg-[#ffd60a]/10 text-[#ffd60a] border-[#ffd60a]/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>
                              {g.status === "done" ? "Готово" : g.status === "processing" ? "В процессе" : g.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/35 text-[12px]">{formatDate(g.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---- REFERRALS ---- */}
            {section === "referrals" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-[24px] font-bold text-white tracking-[-0.025em]">Реферальная программа</h1>
                  <p className="text-[14px] text-white/35 mt-1">Кто кого пригласил</p>
                </div>

                {stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<GitBranch className="w-5 h-5" />} label="Всего рефералов" value={stats.totalReferrals} color="#bf5af2" />
                    <StatCard icon={<Users className="w-5 h-5" />} label="Активных реферов" value={topReferrers.length} color="#4d9fff" />
                    <StatCard icon={<Gift className="w-5 h-5" />} label="Бонусов выдано" value={stats.totalReferrals * 3} sub="+3 за каждого" color="#ffd60a" />
                  </div>
                )}

                <div className="glass rounded-3xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.07]">
                    <h2 className="text-[15px] font-semibold text-white/90">Пользователи с рефералами</h2>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-white/35 text-[11px] uppercase tracking-wider">
                        {["Email", "Реф. код", "Приглашено", "Получено бонусов", "Карточек сделано"].map(h => (
                          <th key={h} className="text-left px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...users].sort((a, b) => b.referralCount - a.referralCount).map(u => (
                        <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-white/80 font-medium">{u.email}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-white/40">{u.referralCode}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-semibold", u.referralCount > 0 ? "text-[#bf5af2]" : "text-white/25")}>{u.referralCount}</span>
                              {u.referralCount > 0 && (
                                <div className="flex-1 max-w-[80px] h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#bf5af2] rounded-full" style={{ width: `${Math.min(100, (u.referralCount / maxRef) * 100)}%` }} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#ffd60a]">{u.referralCount > 0 ? `+${u.referralCount * 3}` : "—"}</td>
                          <td className="px-4 py-3 text-white/50">{u.generationCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}
        </div>
      </main>
    </div>
  );
}
