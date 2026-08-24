import { getResults } from "@/app/actions/vote"
import { HudFrame } from "@/components/hud-frame"
import { ResultsView } from "@/components/results-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "实时开票 · 辩论投票系统",
  description: "正方与反方实时得票，以及最佳辩手前三名。",
}

// Always render fresh counts on load; the client then polls every 4s.
export const dynamic = "force-dynamic"

/**
 * Results display page, intended for the projector / big screen.
 *
 * Deliberately renders ONLY the tally — no ballot, no admin entry point — so it
 * can be left on screen during the debate without exposing controls. Voting
 * lives on "/".
 */
export default async function ViewPage() {
  const results = await getResults()

  return (
    <HudFrame>
      <main className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center gap-8 px-6 py-16 md:px-14">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="size-2 animate-hud-pulse bg-magenta" />
            <span className="font-mono text-[11px] tracking-[0.32em] text-magenta uppercase">
              Live · 实时开票
            </span>
          </div>
          <h1 className="font-display text-4xl font-black tracking-[0.04em] text-balance md:text-6xl">
            辩论投票<span className="text-violet text-glow-violet">结果</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted">结果每 4 秒自动刷新。</p>
        </header>

        <ResultsView initial={results} />

        <footer className="flex items-center justify-center border-t border-panel-edge pt-6">
          <span className="font-mono text-[10px] tracking-[0.28em] text-muted uppercase">
            拉曼理工大学 · 华文学会 辩论社
          </span>
        </footer>
      </main>
    </HudFrame>
  )
}
