import { Router } from "express";
import { randomUUID } from "crypto";
import { db, usersTable, paymentsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";

const router = Router();

const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

const PLANS: Record<string, { amount: number; generations: number; label: string }> = {
  "5gen":  { amount: 299,  generations: 5,  label: "5 генераций" },
  "10gen": { amount: 499,  generations: 10, label: "10 генераций" },
  "25gen": { amount: 999,  generations: 25, label: "25 генераций" },
};

function yookassaAuth() {
  const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64");
  return `Basic ${credentials}`;
}

// POST /api/payments/create
router.post("/create", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body;
    const userId = req.userId!;

    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      res.status(400).json({ error: "Неверный тариф" });
      return;
    }

    if (!SHOP_ID || !SECRET_KEY) {
      res.status(503).json({ error: "Платёжная система не настроена. Обратитесь к администратору." });
      return;
    }

    const replitDomains = process.env.REPLIT_DOMAINS;
    const devDomain = process.env.REPLIT_DEV_DOMAIN;
    const domain = replitDomains ? replitDomains.split(",")[0].trim() : devDomain;
    const returnUrl = `https://${domain}/payment-success`;

    const idempotenceKey = randomUUID();

    const ykRes = await fetch("https://api.yookassa.ru/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": yookassaAuth(),
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify({
        amount: { value: selectedPlan.amount.toFixed(2), currency: "RUB" },
        confirmation: { type: "redirect", return_url: returnUrl },
        description: `CardMaker: ${selectedPlan.label}`,
        metadata: { userId: String(userId), plan, generationsCount: String(selectedPlan.generations) },
      }),
    });

    if (!ykRes.ok) {
      const err = await ykRes.text();
      console.error("YooKassa create payment error:", ykRes.status, err);
      res.status(502).json({ error: "Ошибка создания платежа. Попробуйте позже." });
      return;
    }

    const ykData = await ykRes.json() as any;
    const paymentId = ykData.id;
    const confirmationUrl = ykData.confirmation?.confirmation_url;

    // Save pending payment to DB
    await db.insert(paymentsTable).values({
      userId,
      yookassaPaymentId: paymentId,
      amount: String(selectedPlan.amount),
      generationsCount: selectedPlan.generations,
      status: "pending",
    });

    res.json({ success: true, paymentUrl: confirmationUrl, paymentId });
  } catch (err) {
    console.error("Payment create error:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// GET /api/payments/history
router.get("/history", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.userId, userId))
      .orderBy(desc(paymentsTable.createdAt))
      .limit(50);

    res.json({ payments });
  } catch (err) {
    console.error("Payment history error:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Exported separately so it can be mounted at /api/yookassa-webhook
export async function handleYookassaWebhook(req: any, res: any) {
  try {
    const event = req.body;

    if (event.event !== "payment.succeeded") {
      res.json({ ok: true });
      return;
    }

    const paymentId = event.object?.id;
    const metadata = event.object?.metadata;
    if (!paymentId || !metadata) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    // Verify payment with YooKassa API (don't trust webhook body alone)
    if (SHOP_ID && SECRET_KEY) {
      const verifyRes = await fetch(`https://api.yookassa.ru/v2/payments/${paymentId}`, {
        headers: { "Authorization": yookassaAuth() },
      });
      if (!verifyRes.ok) {
        console.error("YooKassa verify failed:", verifyRes.status);
        res.status(400).json({ error: "Cannot verify payment" });
        return;
      }
      const verifyData = await verifyRes.json() as any;
      if (verifyData.status !== "succeeded" || !verifyData.paid) {
        res.json({ ok: true });
        return;
      }
    }

    const userId = parseInt(metadata.userId, 10);
    const generationsCount = parseInt(metadata.generationsCount, 10);

    if (isNaN(userId) || isNaN(generationsCount)) {
      res.status(400).json({ error: "Invalid metadata" });
      return;
    }

    // Update payment status and add paid generations (idempotent via unique paymentId)
    const [existing] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.yookassaPaymentId, paymentId))
      .limit(1);

    if (!existing || existing.status === "succeeded") {
      // Already processed
      res.json({ ok: true });
      return;
    }

    await db
      .update(paymentsTable)
      .set({ status: "succeeded" })
      .where(eq(paymentsTable.yookassaPaymentId, paymentId));

    await db
      .update(usersTable)
      .set({ paidGenerations: sql`${usersTable.paidGenerations} + ${generationsCount}` })
      .where(eq(usersTable.id, userId));

    console.log(`✅ Payment ${paymentId}: user ${userId} +${generationsCount} paid generations`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Internal error" });
  }
}

export default router;
