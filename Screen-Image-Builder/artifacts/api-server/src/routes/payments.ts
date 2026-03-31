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

// GET /api/payments/check-credentials (admin diagnostic)
router.get("/check-credentials", requireAuth as any, async (_req: AuthRequest, res) => {
  if (!SHOP_ID || !SECRET_KEY) {
    res.json({ ok: false, reason: "YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не заданы" });
    return;
  }
  try {
    const r = await fetch("https://api.yookassa.ru/v2/me", {
      headers: { "Authorization": yookassaAuth() },
    });
    const body = await r.json() as any;
    res.json({ status: r.status, shopId: SHOP_ID, shopIdLength: SHOP_ID.length, body });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

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
      const errText = await ykRes.text();
      console.error("YooKassa create payment error:", ykRes.status, errText);
      console.error("YooKassa auth shop_id length:", SHOP_ID?.length, "secret starts with:", SECRET_KEY?.slice(0, 6));

      let userMessage = "Ошибка создания платежа. Попробуйте позже.";
      if (ykRes.status === 401) userMessage = "Ошибка авторизации ЮKassa: неверный Shop ID или секретный ключ.";
      else if (ykRes.status === 404) userMessage = "Магазин ЮKassa не найден. Проверьте Shop ID в настройках.";
      else if (ykRes.status === 400) userMessage = "Некорректный запрос к ЮKassa. Обратитесь к администратору.";

      res.status(502).json({ error: userMessage });
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

    // Try to verify payment with YooKassa API for extra security.
    // If the API is unreachable (network issues), fall back to trusting the webhook event.
    if (SHOP_ID && SECRET_KEY) {
      try {
        const verifyRes = await fetch(`https://api.yookassa.ru/v2/payments/${paymentId}`, {
          headers: { "Authorization": yookassaAuth() },
          signal: AbortSignal.timeout(5000),
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json() as any;
          if (verifyData.status !== "succeeded" || !verifyData.paid) {
            console.log(`Payment ${paymentId} not succeeded per YooKassa, skipping`);
            res.json({ ok: true });
            return;
          }
        } else {
          // API reachable but returned error — trust webhook event body
          console.warn(`YooKassa verify returned ${verifyRes.status}, trusting webhook event`);
        }
      } catch (verifyErr: any) {
        // Network error — trust webhook event body, log for audit
        console.warn(`YooKassa verify unreachable (${verifyErr.message}), trusting webhook event`);
      }
    }

    // Extra guard: check event status directly
    if (event.object?.status !== "succeeded" || !event.object?.paid) {
      console.log(`Webhook event for ${paymentId} not succeeded, skipping`);
      res.json({ ok: true });
      return;
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
