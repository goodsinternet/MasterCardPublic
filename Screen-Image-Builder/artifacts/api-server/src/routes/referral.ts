import { Router } from "express";
import { db, usersTable, referralsTable, bonusTransactionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/apply", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId!;

    if (!code) {
      res.status(400).json({ error: "Код обязателен" });
      return;
    }

    const [referrer] = await db.select().from(usersTable)
      .where(eq(usersTable.referralCode, code.toUpperCase()))
      .limit(1);

    if (!referrer) {
      res.status(404).json({ error: "Реферальный код не найден" });
      return;
    }

    if (referrer.id === userId) {
      res.status(400).json({ error: "Нельзя использовать собственный код" });
      return;
    }

    const existing = await db.select().from(referralsTable)
      .where(eq(referralsTable.referredId, userId))
      .limit(1);

    if (existing.length) {
      res.status(400).json({ error: "Вы уже использовали реферальный код" });
      return;
    }

    const [referral] = await db.insert(referralsTable).values({
      referrerId: referrer.id,
      referredId: userId,
    }).returning();

    await db.update(usersTable)
      .set({ bonusGenerations: sql`${usersTable.bonusGenerations} + 3` })
      .where(eq(usersTable.id, referrer.id));

    await db.insert(bonusTransactionsTable).values({
      userId: referrer.id,
      amount: 3,
      source: "referral",
      referralId: referral.id,
    });

    res.json({ success: true, message: "Реферальный код принят! Ваш партнёр получил +3 генерации" });
  } catch (err) {
    req.log.error({ err }, "Apply referral error");
    res.status(500).json({ error: "Ошибка применения кода" });
  }
});

export default router;
