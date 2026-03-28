import { Router } from "express";
import { db, usersTable, generationsTable, referralsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    const generations = await db.select().from(generationsTable)
      .where(eq(generationsTable.userId, userId))
      .orderBy(generationsTable.createdAt);

    const [referralData] = await db.select({ count: count() }).from(referralsTable)
      .where(eq(referralsTable.referrerId, userId));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        bonusGenerations: user.bonusGenerations,
        isAdmin: user.isAdmin,
      },
      generations: generations.map(g => ({
        id: g.id,
        outputText: g.outputText,
        outputImageUrl: g.outputImageUrl,
        marketplace: g.marketplace,
        price: g.price,
        productName: g.productName,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
      })),
      referralCount: Number(referralData?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Get user error");
    res.status(500).json({ error: "Ошибка получения данных" });
  }
});

export default router;
