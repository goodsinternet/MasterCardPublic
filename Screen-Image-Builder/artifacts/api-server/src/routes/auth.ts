import { Router } from "express";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, signToken, generateReferralCode } from "../lib/auth.js";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, referralCode: inputReferralCode } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email и пароль обязательны" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length) {
      res.status(400).json({ error: "Пользователь уже существует" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const referralCode = generateReferralCode();

    let referrerId: number | undefined;
    if (inputReferralCode) {
      const referrer = await db.select().from(usersTable)
        .where(eq(usersTable.referralCode, inputReferralCode.toUpperCase()))
        .limit(1);
      if (referrer.length) {
        referrerId = referrer[0].id;
      }
    }

    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash,
      referralCode,
      referrerId,
      bonusGenerations: 3,
    }).returning();

    const token = signToken(user.id);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        bonusGenerations: user.bonusGenerations,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Ошибка регистрации" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email и пароль обязательны" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }

    const token = signToken(user.id);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        bonusGenerations: user.bonusGenerations,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Ошибка входа" });
  }
});

router.post("/logout", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization?.slice(7);
    if (token) {
      await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    }
    res.json({ success: true, message: "Выход выполнен" });
  } catch (err) {
    req.log.error({ err }, "Logout error");
    res.status(500).json({ error: "Ошибка выхода" });
  }
});

export default router;
