import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type AdminUser = {
  id: number;
  email: string;
  isAdmin: boolean;
  bonusGenerations: number;
  referralCode: string;
  createdAt: string;
  generationCount: number;
};

type AdminGeneration = {
  id: number;
  userId: number;
  marketplace: string | null;
  productName: string | null;
  price: string | null;
  status: string;
  createdAt: string;
};

type Stats = {
  totalUsers: number;
  totalGenerations: number;
  doneGenerations: number;
};

const MARKETPLACE_LABELS: Record<string, string> = {
  wildberries: "Wildberries",
  ozon: "Ozon",
  yandex: "Яндекс Маркет",
  universal: "Универсальный",
};

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [generations, setGenerations] = useState<AdminGeneration[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "generations">("users");
  const [editingUser, setEditingUser] = useState<{ id: number; value: string } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    loadAll();
  }, [user]);

  async function loadAll() {
    setDataLoading(true);
    try {
      const [statsData, usersData, gensData] = await Promise.all([
        api.admin.stats(),
        api.admin.users(),
        api.admin.generations(),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setGenerations(gensData.generations);
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
    } finally {
      setDataLoading(false);
    }
  }

  async function handleUpdateGenerations(userId: number) {
    if (!editingUser || editingUser.id !== userId) return;
    const val = Number(editingUser.value);
    if (isNaN(val) || val < 0) {
      toast({ title: "Введите корректное число", variant: "destructive" });
      return;
    }
    try {
      await api.admin.updateGenerations(userId, val);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, bonusGenerations: val } : u));
      setEditingUser(null);
      toast({ title: "Генерации обновлены" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if (loading || !user?.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold">A</div>
          <div>
            <h1 className="text-lg font-bold">Панель администратора</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">← Вернуться в дашборд</a>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Пользователей", value: stats.totalUsers, color: "from-blue-500 to-blue-700" },
              { label: "Всего генераций", value: stats.totalGenerations, color: "from-violet-500 to-violet-700" },
              { label: "Успешных", value: stats.doneGenerations, color: "from-emerald-500 to-emerald-700" },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <div className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800">
          {(["users", "generations"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-violet-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab === "users" ? `Пользователи (${users.length})` : `Генерации (${generations.length})`}
            </button>
          ))}
          <button
            onClick={loadAll}
            className="ml-auto px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Обновить
          </button>
        </div>

        {dataLoading ? (
          <div className="text-center py-12 text-gray-400">Загрузка данных...</div>
        ) : activeTab === "users" ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Роль</th>
                  <th className="text-left px-4 py-3">Генераций</th>
                  <th className="text-left px-4 py-3">Кол-во карточек</th>
                  <th className="text-left px-4 py-3">Реф. код</th>
                  <th className="text-left px-4 py-3">Дата регистрации</th>
                  <th className="text-left px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{u.id}</td>
                    <td className="px-4 py-3 font-medium">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-violet-900/50 text-violet-300 border border-violet-700">Админ</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400">Пользователь</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser?.id === u.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingUser.value}
                            onChange={e => setEditingUser({ id: u.id, value: e.target.value })}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                            min={0}
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateGenerations(u.id)}
                            className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-500 rounded transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <span className={u.isAdmin ? "text-emerald-400" : u.bonusGenerations === 0 ? "text-red-400" : "text-white"}>
                          {u.isAdmin ? "∞" : u.bonusGenerations}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.generationCount}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{u.referralCode}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {!u.isAdmin && editingUser?.id !== u.id && (
                        <button
                          onClick={() => setEditingUser({ id: u.id, value: String(u.bonusGenerations) })}
                          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          Изменить генерации
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">User ID</th>
                  <th className="text-left px-4 py-3">Маркетплейс</th>
                  <th className="text-left px-4 py-3">Товар</th>
                  <th className="text-left px-4 py-3">Цена</th>
                  <th className="text-left px-4 py-3">Статус</th>
                  <th className="text-left px-4 py-3">Дата</th>
                </tr>
              </thead>
              <tbody>
                {generations.map(g => (
                  <tr key={g.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{g.id}</td>
                    <td className="px-4 py-3 text-gray-400">{g.userId}</td>
                    <td className="px-4 py-3">{MARKETPLACE_LABELS[g.marketplace ?? ""] ?? g.marketplace ?? "—"}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={g.productName ?? ""}>{g.productName ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{g.price ? `${g.price} ₽` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        g.status === "done" ? "bg-emerald-900/50 text-emerald-300 border border-emerald-800" :
                        g.status === "processing" ? "bg-yellow-900/50 text-yellow-300 border border-yellow-800" :
                        "bg-red-900/50 text-red-300 border border-red-800"
                      }`}>
                        {g.status === "done" ? "Готово" : g.status === "processing" ? "В процессе" : g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(g.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
