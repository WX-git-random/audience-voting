import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const votes = pgTable("votes", {
  email: text("email").primaryKey(),
  choiceTeam: text("choice_team").notNull(),
  choiceSpeaker: text("choice_speaker").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Vote = typeof votes.$inferSelect

/**
 * Tiny key/value store for session-wide switches (currently just the ballot
 * lock). Kept in Postgres rather than memory so every serverless instance and
 * every device agrees on whether voting is open.
 */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
