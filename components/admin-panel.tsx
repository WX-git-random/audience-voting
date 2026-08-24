"use client"

import { useState, useTransition } from "react"
import { LogOut, RotateCcw, TriangleAlert } from "lucide-react"
import { clearAllVotes, logout } from "@/app/actions/admin"
import { HudPanel } from "./hud-frame"

export function AdminPanel({ totalVotes }: { totalVotes: number }) {
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleClear() {
    startTransition(async () => {
      const result = await clearAllVotes()
      setConfirming(false)
      setMessage(result.error ? result.error : `已清除 ${result.cleared ?? 0} 条投票，新一轮可以开始。`)
    })
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <HudPanel accent="violet" className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-mono text-sm tracking-[0.24em] uppercase">Session Control</h2>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] text-muted uppercase transition-colors hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                退出
              </button>
            </form>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-black tabular-nums">{totalVotes}</span>
            <span className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">当前投票数</span>
          </div>

          {message ? (
            <p role="status" className="hud-clip-sm border border-violet/50 bg-violet/10 px-4 py-3 text-sm">
              {message}
            </p>
          ) : null}
        </div>
      </HudPanel>

      <HudPanel accent="magenta" className="p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <TriangleAlert className="h-5 w-5 text-magenta" aria-hidden="true" />
            <h2 className="font-mono text-sm tracking-[0.24em] uppercase">Danger Zone</h2>
          </div>

          <p className="text-sm leading-relaxed text-muted">
            清除全部投票并开始新一轮。所有观众都可以重新投票，此操作无法撤销。
          </p>

          {confirming ? (
            <div className="hud-clip-sm flex flex-col gap-4 border border-magenta/50 bg-magenta/10 p-5">
              <p className="text-sm leading-relaxed text-pretty">
                确定要清除全部 <span className="font-display font-black text-magenta">{totalVotes}</span> 条投票吗？
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={pending}
                  className="hud-clip-sm border border-magenta bg-magenta/30 px-6 py-3 font-mono text-sm tracking-[0.24em] uppercase transition-colors hover:bg-magenta/50 disabled:opacity-50"
                >
                  {pending ? "清除中…" : "确认清除"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="hud-clip-sm border border-panel-edge px-6 py-3 font-mono text-sm tracking-[0.24em] uppercase transition-colors hover:border-muted disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMessage(null)
                setConfirming(true)
              }}
              className="hud-clip-sm flex items-center justify-center gap-2 self-start border border-magenta bg-magenta/20 px-6 py-3 font-mono text-sm tracking-[0.24em] uppercase transition-colors hover:bg-magenta/40"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              清除全部投票
            </button>
          )}
        </div>
      </HudPanel>
    </div>
  )
}
