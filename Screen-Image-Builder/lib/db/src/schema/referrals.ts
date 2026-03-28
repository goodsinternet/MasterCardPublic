import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bonusTransactionsTable = pgTable("bonus_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull().default(3),
  source: text("source").notNull().default("referral"),
  referralId: integer("referral_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({ id: true, createdAt: true });
export const insertBonusTransactionSchema = createInsertSchema(bonusTransactionsTable).omit({ id: true, createdAt: true });
export type Referral = typeof referralsTable.$inferSelect;
export type BonusTransaction = typeof bonusTransactionsTable.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type InsertBonusTransaction = z.infer<typeof insertBonusTransactionSchema>;
