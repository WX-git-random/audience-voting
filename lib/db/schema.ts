import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const votes = pgTable("votes", {
  email: text("email").primaryKey(),
  choiceTeam: text("choice_team").notNull(),
  choiceSpeaker: text("choice_speaker").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Vote = typeof votes.$inferSelect
