"use server"

import { db } from "@/lib/db"
import { votes } from "@/lib/db/schema"
import { loadRegisteredEmails } from "@/lib/sheets"
import { SPEAKERS, TEAMS, type Speaker, type Team } from "@/lib/vote-config"
import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type VoteState = {
  status: "idle" | "success" | "error" | "unregistered"
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function getResults() {
  const rows = await db
    .select({
      choiceTeam: votes.choiceTeam,
      choiceSpeaker: votes.choiceSpeaker,
    })
    .from(votes)

  const teamCounts = Object.fromEntries(TEAMS.map((t) => [t, 0])) as Record<Team, number>
  const speakerCounts = Object.fromEntries(SPEAKERS.map((s) => [s, 0])) as Record<Speaker, number>

  for (const row of rows) {
    if (row.choiceTeam in teamCounts) teamCounts[row.choiceTeam as Team] += 1
    if (row.choiceSpeaker in speakerCounts) speakerCounts[row.choiceSpeaker as Speaker] += 1
  }

  return { total: rows.length, teamCounts, speakerCounts }
}

export async function getMyVote(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null
  const [row] = await db.select().from(votes).where(eq(votes.email, normalized)).limit(1)
  return row ?? null
}

export async function submitVote(input: {
  email: string
  choiceTeam: string
  choiceSpeaker: string
}): Promise<VoteState> {
  const email = input.email.trim().toLowerCase()

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "请输入一个有效的电子邮箱" }
  }
  if (!TEAMS.includes(input.choiceTeam as Team)) {
    return { status: "error", message: "请选择支持的一方" }
  }
  if (!SPEAKERS.includes(input.choiceSpeaker as Speaker)) {
    return { status: "error", message: "请选择最佳辩手" }
  }

  // The allowlist is checked on EVERY submission, including vote changes.
  // Previously this was skipped for emails already in the votes table, which
  // permanently grandfathered in anyone who voted while the Google credentials
  // were missing — they could keep voting forever. Re-checking every time also
  // means removing someone from the sheet actually revokes their access.
  const allowlist = await loadRegisteredEmails()

  if (allowlist.status === "error") {
    return {
      status: "error",
      message: "无法验证注册名单，请稍后再试。",
    }
  }

  // When credentials are absent the allowlist cannot be enforced; voting stays
  // open so the app remains usable, and the UI surfaces a warning banner.
  if (allowlist.status === "ok" && !allowlist.emails.has(email)) {
    return {
      status: "unregistered",
      message: "请先提交 Google Form 进行注册",
    }
  }

  await db
    .insert(votes)
    .values({
      email,
      choiceTeam: input.choiceTeam,
      choiceSpeaker: input.choiceSpeaker,
    })
    .onConflictDoUpdate({
      target: votes.email,
      set: {
        choiceTeam: input.choiceTeam,
        choiceSpeaker: input.choiceSpeaker,
        updatedAt: sql`now()`,
      },
    })

  revalidatePath("/")
  return { status: "success", message: "投票成功，你可以随时更改" }
}
