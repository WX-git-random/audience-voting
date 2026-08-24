import { getResults } from "@/app/actions/vote"
import { HudFrame, HudPanel } from "@/components/hud-frame"
import { ResultsView } from "@/components/results-view"
import { VoteForm } from "@/components/vote-form"

export const dynamic = "force-dynamic"

export default async function Page() {
  const results = await getResults()
  const allowlistConfigured = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_SHEET_ID,
  )

  return (
    <HudFrame>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-20 md:px-14 md:py-24">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="size-2 animate-hud-pulse bg-magenta" />
            <span className="font-mono text-[11px] tracking-[0.32em] text-magenta uppercase">
              Live · 实时开票
            </span>
          </div>
          <h1 className="font-display text-4xl font-black tracking-[0.04em] text-balance md:text-6xl">
            辩论投票<span className="text-violet text-glow-violet">系统</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            使用注册邮箱投票支持正方或反方，并评选最佳辩手。结果每 4 秒自动刷新。
          </p>
        </header>

        {!allowlistConfigured && (
          <HudPanel accent="magenta" className="px-5 py-4">
            <p className="font-mono text-xs leading-relaxed tracking-wide text-muted">
              {"// 注册名单校验未启用：未配置 Google Sheets 凭证，当前任何邮箱均可投票。"}
            </p>
          </HudPanel>
        )}

        <ResultsView initial={results} />
        <VoteForm />

        <footer className="flex items-center justify-between border-t border-panel-edge pt-6">
          <span className="font-mono text-[10px] tracking-[0.28em] text-muted uppercase">
            Debate Poll · v2
          </span>
          <span className="font-mono text-[10px] tracking-[0.28em] text-muted uppercase">
            Neon · Vercel
          </span>
        </footer>
      </main>
    </HudFrame>
  )
}
