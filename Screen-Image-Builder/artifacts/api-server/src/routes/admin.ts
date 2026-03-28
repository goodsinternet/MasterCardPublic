import { Router } from "express";
import { db, usersTable, generationsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
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
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(usersTable);
    const [{ totalGenerations }] = await db.select({ totalGenerations: count() }).from(generationsTable);
    const [{ doneGenerations }] = await db.select({ doneGenerations: count() })
      .from(generationsTable)
      .where(eq(generationsTable.status, "done"));

    res.json({ totalUsers, totalGenerations, doneGenerations });
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
      bonusGenerations: usersTable.bonusGenerations,
      referralCode: usersTable.referralCode,
      createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(desc(usersTable.createdAt));

    const genCounts = await db.select({
      userId: generationsTable.userId,
      count: count(),
    }).from(generationsTable).groupBy(generationsTable.userId);

    const countMap = Object.fromEntries(genCounts.map(r => [r.userId, Number(r.count)]));

    res.json({
      users: users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        generationCount: countMap[u.id] ?? 0,
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
