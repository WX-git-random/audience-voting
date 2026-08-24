import { HudFrame } from "@/components/hud-frame"
import { VoteForm } from "@/components/vote-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "投票通道 · 辩论投票系统",
  description: "使用注册邮箱投票支持正方或反方，并评选最佳辩手。",
}

/**
 * Audience-facing voting page.
 *
 * Deliberately renders ONLY the ballot — no live tally, no admin entry point.
 * Keeping the running results off this page avoids a bandwagon effect where
 * voters are swayed by the current standings, and leaves the projector view
 * ("/") as the single place results are shown.
 */
export default function ViewPage() {
  return (
    <HudFrame>
      <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-8 px-6 py-16 md:px-14">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="size-2 animate-hud-pulse bg-magenta" />
            <span className="font-mono text-[11px] tracking-[0.32em] text-magenta uppercase">
              Ballot Open · 投票进行中
            </span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-[0.04em] text-balance md:text-5xl">
            辩论<span className="text-violet text-glow-violet">投票</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            请使用你注册时提交的电子邮箱投票。投票可随时修改，以最后一次提交为准。
          </p>
        </header>

        <VoteForm />

        <footer className="flex items-center justify-center border-t border-panel-edge pt-6">
          <span className="font-mono text-[10px] tracking-[0.28em] text-muted uppercase">
            拉曼理工大学 · 华文学会 辩论社
          </span>
        </footer>
      </main>
    </HudFrame>
  )
}
