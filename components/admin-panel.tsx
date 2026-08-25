"use client"

import { useState, useTransition } from "react"
import { Lock, LockOpen, LogOut, RotateCcw, TriangleAlert } from "lucide-react"
import { clearAllVotes, logout, setBallotLock } from "@/app/actions/admin"
import { HudPanel } from "./hud-frame"

export function AdminPanel({
  totalVotes,
  initialLocked,
}: {
  totalVotes: number
  initialLocked: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [locked, setLocked] = useState(initialLocked)
  const [pending, startTransition] = useTransition()
  const [lockPending, startLockTransition] = useTransition()

  function handleClear() {
    startTransition(async () => {
      const result = await clearAllVotes()
      setConfirming(false)
      setMessage(result.error ? result.error : `已清除 ${result.cleared ?? 0} 条投票，新一轮可以开始。`)
    })
  }

  function handleToggleLock() {
    const next = !locked
    startLockTransition(async () => {
      const result = await setBallotLock(next)
      if (result.error) {
        setMessage(result.error)
        return
      }
      setLocked(next)
      setMessage(next ? "投票已锁定，观众无法再提交或修改。" : "投票已开放，观众可以提交。")
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

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl font-black tabular-nums">{totalVotes}</span>
              <span className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">当前投票数</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">Ballot</span>
              <span
                className={`flex items-center gap-2 font-display text-lg font-black ${
                  locked ? "text-magenta text-glow-magenta" : "text-violet text-glow-violet"
                }`}
              >
                {locked ? (
                  <Lock className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <LockOpen className="h-4 w-4" aria-hidden="true" />
                )}
                {locked ? "已锁定" : "开放中"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-panel-edge pt-6">
            <p className="text-sm leading-relaxed text-muted">
              锁定后观众无法提交或修改投票，已有票数保留。适合在辩论结束、准备开票时使用。
            </p>
            <button
              type="button"
              onClick={handleToggleLock}
              disabled={lockPending}
              aria-pressed={locked}
              className={`hud-clip-sm flex items-center justify-center gap-2 self-start border px-6 py-3 font-mono text-sm tracking-[0.24em] uppercase transition-colors disabled:opacity-50 ${
                locked
                  ? "border-violet bg-violet/25 hover:bg-violet/45"
                  : "border-magenta bg-magenta/20 hover:bg-magenta/40"
              }`}
            >
              {locked ? (
                <LockOpen className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Lock className="h-4 w-4" aria-hidden="true" />
              )}
              {lockPending ? "处理中…" : locked ? "解锁投票" : "锁定投票"}
            </button>
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
