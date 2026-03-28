import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  yookassaPaymentId: text("yookassa_payment_id").unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  generationsCount: integer("generations_count").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Payment = typeof paymentsTable.$inferSelect;
