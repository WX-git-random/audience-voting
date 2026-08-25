import type { Metadata } from "next"
import { count } from "drizzle-orm"
import { db } from "@/lib/db"
import { votes } from "@/lib/db/schema"
import { isAdmin } from "@/lib/admin-auth"
import { isVotingLocked } from "@/lib/vote-lock"
import { AdminLogin } from "@/components/admin-login"
import { AdminPanel } from "@/components/admin-panel"

export const metadata: Metadata = {
  title: "管理后台 | 辩论投票系统",
  // Keep this page out of search results.
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const authed = await isAdmin()

  if (!authed) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5 py-16">
        <AdminLogin />
      </main>
    )
  }

  const [[row], locked] = await Promise.all([
    db.select({ value: count() }).from(votes),
    isVotingLocked(),
  ])

  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 px-5 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs tracking-[0.35em] text-muted uppercase">Administrator</span>
        <h1 className="font-display text-3xl font-black tracking-[0.04em] text-balance md:text-4xl">管理后台</h1>
      </header>
      <AdminPanel totalVotes={row?.value ?? 0} initialLocked={locked} />
    </main>
  )
}
