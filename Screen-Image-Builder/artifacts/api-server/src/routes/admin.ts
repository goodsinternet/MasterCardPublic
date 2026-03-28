import { Router } from "express";
import { db, usersTable, generationsTable, bonusTransactionsTable, referralsTable } from "@workspace/db";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";

const router = Router();

async function requireAdmin(req: AuthRequest, res: any, next: any) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user?.isAdmin) {
    res.status(403).json({ error: "Доступ запрещён" });
    return;
  }
  next();
}

router.get("/stats", requireAuth as any, requireAdmin as any, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [[{ totalUsers }], [{ totalGenerations }], [{ doneGenerations }], [{ pendingGenerations }], [{ totalReferrals }], [{ newUsersToday }], [{ newUsersWeek }]] = await Promise.all([
      db.select({ totalUsers: count() }).from(usersTable),
      db.select({ totalGenerations: count() }).from(generationsTable),
      db.select({ doneGenerations: count() }).from(generationsTable).where(eq(generationsTable.status, "done")),
      db.select({ pendingGenerations: count() }).from(generationsTable).where(eq(generationsTable.status, "processing")),
      db.select({ totalReferrals: count() }).from(referralsTable),
      db.select({ newUsersToday: count() }).from(usersTable).where(gte(usersTable.createdAt, todayStart)),
      db.select({ newUsersWeek: count() }).from(usersTable).where(gte(usersTable.createdAt, weekStart)),
    ]);

    const marketplaceStats = await db
      .select({ marketplace: generationsTable.marketplace, count: count() })
      .from(generationsTable)
      .where(eq(generationsTable.status, "done"))
      .groupBy(generationsTable.marketplace)
      .orderBy(desc(count()));

    const avgGen = totalUsers > 0 ? Math.round((totalGenerations / totalUsers) * 10) / 10 : 0;
    const successRate = totalGenerations > 0 ? Math.round((doneGenerations / totalGenerations) * 100) : 0;

    res.json({
      totalUsers,
      totalGenerations,
      doneGenerations,
      pendingGenerations,
      totalReferrals,
      newUsersToday,
      newUsersWeek,
      avgGenerationsPerUser: avgGen,
      successRate,
      marketplaceStats: marketplaceStats.map(r => ({ marketplace: r.marketplace ?? "unknown", count: Number(r.count) })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Ошибка" });
  }
});

router.get("/users", requireAuth as any, requireAdmin as any, async (req: AuthRequest, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      isAdmin: usersTable.isAdmin,
      freeGenerations: usersTable.freeGenerations,
      bonusGenerations: usersTable.bonusGenerations,
      referralCode: usersTable.referralCode,
      referrerId: usersTable.referrerId,
      createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(desc(usersTable.createdAt));

    const genCounts = await db.select({ userId: generationsTable.userId, count: count() })
      .from(generationsTable).groupBy(generationsTable.userId);

    const refCounts = await db.select({ referrerId: referralsTable.referrerId, count: count() })
      .from(referralsTable).groupBy(referralsTable.referrerId);

    const countMap = Object.fromEntries(genCounts.map(r => [r.userId, Number(r.count)]));
    const refMap = Object.fromEntries(refCounts.map(r => [r.referrerId, Number(r.count)]));

    res.json({
      users: users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        generationCount: countMap[u.id] ?? 0,
        referralCount: refMap[u.id] ?? 0,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin users error");
    res.status(500).json({ error: "Ошибка" });
  }
});

router.get("/generations", requireAuth as any, requireAdmin as any, async (req: AuthRequest, res) => {
  try {
    const generations = await db.select().from(generationsTable)
      .orderBy(desc(generationsTable.createdAt))
      .limit(100);

    res.json({
      generations: generations.map(g => ({
        id: g.id,
        userId: g.userId,
        marketplace: g.marketplace,
        productName: g.productName,
        price: g.price,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin generations error");
    res.status(500).json({ error: "Ошибка" });
  }
});

router.patch("/users/:id/generations", requireAuth as any, requireAdmin as any, async (req: AuthRequest, res) => {
  try {
    const userId = Number(req.params.id);
    const { bonusGenerations } = req.body;
    if (typeof bonusGenerations !== "number") {
      res.status(400).json({ error: "bonusGenerations должен быть числом" });
      return;
    }
    const [updated] = await db.update(usersTable)
      .set({ bonusGenerations })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id, email: usersTable.email, bonusGenerations: usersTable.bonusGenerations });
    res.json({ user: updated });
  } catch (err) {
    req.log.error({ err }, "Admin update generations error");
    res.status(500).json({ error: "Ошибка" });
  }
});

export default router;
