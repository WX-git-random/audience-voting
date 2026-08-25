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
 * Results display page, intended for the auditorium LED wall.
 *
 * Fills the viewport exactly (h-svh, no scroll) and sizes everything in
 * viewport units so it reads from the back of a hall. Renders ONLY the tally —
 * no ballot, no admin entry point — so it can be left up during the debate.
 * Voting lives on "/".
 */
export default async function ViewPage() {
  const results = await getResults()
  const locked = results.locked ?? false

  return (
    <HudFrame>
      <main className="flex h-svh flex-col gap-[1.6vh] overflow-hidden px-[3vw] py-[2.5vh]">
        {/* The HUD chrome owns the top-right corner, so the header keeps to the
            left half and the org credit sits on its own bottom line. */}
        <header className="flex flex-col gap-[0.6vh] pr-[18rem]">
          <div className="flex items-center gap-3">
            <span className={`size-2 bg-magenta ${locked ? "opacity-40" : "animate-hud-pulse"}`} />
            <span className="font-mono text-[clamp(0.7rem,min(1.1vw,2vh),1.35rem)] tracking-[0.32em] text-magenta uppercase">
              {locked ? "Final · 投票已关闭" : "Live · 实时开票"}
            </span>
          </div>
          <h1 className="font-display font-black leading-none tracking-[0.04em] text-balance text-[clamp(1.75rem,min(5.5vw,9vh),7rem)]">
            辩论投票<span className="text-violet text-glow-violet">结果</span>
          </h1>
        </header>

        <ResultsView initial={results} />

        <footer className="flex shrink-0 items-center justify-center">
          <span className="font-mono text-[clamp(0.6rem,min(0.95vw,1.6vh),1.2rem)] tracking-[0.28em] text-muted uppercase">
            拉曼理工大学 · 华文学会 辩论社
          </span>
        </footer>
      </main>
    </HudFrame>
  )
}
