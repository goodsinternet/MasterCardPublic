import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralRewardsTable = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull().default(1),
  sourceReferralId: integer("source_referral_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({ id: true, createdAt: true });
export const insertReferralRewardSchema = createInsertSchema(referralRewardsTable).omit({ id: true, createdAt: true });
export type Referral = typeof referralsTable.$inferSelect;
export type ReferralReward = typeof referralRewardsTable.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
