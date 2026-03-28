import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";
import { db, sessionsTable } from "@workspace/db";
import { eq, gt } from "drizzle-orm";

export interface AuthRequest extends Request {
  userId?: number;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const session = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.token, token))
    .limit(1);

  if (!session.length || session[0].expiresAt < new Date()) {
    res.status(401).json({ error: "Session expired" });
    return;
  }

  req.userId = payload.userId;
  next();
}
