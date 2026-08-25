import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

const LOCK_KEY = "ballot_locked"

/**
 * Whether the ballot is currently closed. Stored in Postgres so the switch is
 * global — flipping it in the admin panel closes voting for every device, and
 * it survives redeploys and cold starts.
 *
 * Fails OPEN: if the settings read errors we let voting continue rather than
 * silently locking out an entire auditorium.
 */
export async function isVotingLocked(): Promise<boolean> {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, LOCK_KEY)).limit(1)
    return row?.value === "true"
  } catch {
    return false
  }
}

export async function setVotingLocked(locked: boolean) {
  await db
    .insert(settings)
    .values({ key: LOCK_KEY, value: locked ? "true" : "false" })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: locked ? "true" : "false", updatedAt: sql`now()` },
    })
}
