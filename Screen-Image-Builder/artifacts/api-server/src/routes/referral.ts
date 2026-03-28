import { Router } from "express";
import { db, usersTable, referralsTable, referralRewardsTable } from "@workspace/db";
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
      .where(and(
        eq(referralsTable.referredId, userId),
        eq(referralsTable.referrerId, referrer.id),
      ))
      .limit(1);

    if (existing.length) {
      res.status(400).json({ error: "Реферальный код уже был использован" });
      return;
    }

    const [referral] = await db.insert(referralsTable).values({
      referrerId: referrer.id,
      referredId: userId,
    }).returning();

    await db.update(usersTable)
      .set({ bonusGenerations: sql`${usersTable.bonusGenerations} + 2` })
      .where(eq(usersTable.id, userId));

    await db.update(usersTable)
      .set({ bonusGenerations: sql`${usersTable.bonusGenerations} + 1` })
      .where(eq(usersTable.id, referrer.id));

    await db.insert(referralRewardsTable).values([
      { userId, type: "referred_bonus", amount: 2, sourceReferralId: referral.id },
      { userId: referrer.id, type: "referrer_bonus", amount: 1, sourceReferralId: referral.id },
    ]);

    res.json({ success: true, message: "Реферальный код применён! +2 генерации добавлены" });
  } catch (err) {
    req.log.error({ err }, "Apply referral error");
    res.status(500).json({ error: "Ошибка применения кода" });
  }
});

export default router;
