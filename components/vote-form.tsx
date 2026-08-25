"use client"

import { submitVote, type VoteState } from "@/app/actions/vote"
import { HudLabel, HudPanel } from "@/components/hud-frame"
import { REGISTRATION_URL, SPEAKERS, TEAMS, teamOf } from "@/lib/vote-config"
import { Lock } from "lucide-react"
import { useState, useTransition } from "react"
import useSWR, { useSWRConfig } from "swr"

const lockFetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<{ locked: boolean }>)

export function VoteForm({ initialLocked }: { initialLocked: boolean }) {
  const [email, setEmail] = useState("")
  const [team, setTeam] = useState<string>(TEAMS[0])
  const [speaker, setSpeaker] = useState<string>(SPEAKERS[0])
  const [state, setState] = useState<VoteState>({ status: "idle", message: "" })
  const [pending, startTransition] = useTransition()
  const { mutate } = useSWRConfig()

  // Poll so the ballot closes on the audience's phones within seconds of the
  // admin flipping the switch, without anyone needing to refresh.
  const { data } = useSWR("/api/results", lockFetcher, {
    fallbackData: { locked: initialLocked },
    refreshInterval: 5000,
  })
  const locked = data?.locked ?? initialLocked

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await submitVote({ email, choiceTeam: team, choiceSpeaker: speaker })
      setState(result)
      if (result.status === "success") mutate("/api/results")
    })
  }

  return (
    <HudPanel className="p-6 md:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <HudLabel>Cast Ballot / 投票通道</HudLabel>
          <p className="text-sm text-muted">投票可随时修改，以最后一次提交为准。</p>
        </div>

        {locked && (
          <div
            role="status"
            aria-live="polite"
            className="hud-clip-sm flex items-center gap-3 border border-magenta bg-magenta/15 px-4 py-3"
          >
            <Lock className="h-4 w-4 shrink-0 text-magenta" aria-hidden="true" />
            <p className="text-sm leading-relaxed">投票通道已关闭，感谢参与。</p>
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Email / 电子邮箱
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={99}
            disabled={locked}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="hud-clip-sm border border-panel-edge bg-background/60 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-violet"
          />
        </div>

        {/* Team */}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            你支持哪一方
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {TEAMS.map((t) => {
              const active = team === t
              const isAff = t === "正方"
              return (
                <label
                  key={t}
                  className={`hud-clip-sm border px-4 py-4 text-center text-base transition-all ${
                    locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  } ${
                    active
                      ? isAff
                        ? "border-aff bg-aff/25 text-glow-aff"
                        : "border-neg-lit bg-neg/40 text-glow-neg"
                      : "border-panel-edge text-muted hover:border-violet/60 hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="team"
                    value={t}
                    checked={active}
                    disabled={locked}
                    onChange={() => setTeam(t)}
                    className="sr-only"
                  />
                  {t}
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* Speaker */}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            最佳辩手
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SPEAKERS.map((s) => {
              const active = speaker === s
              const isAff = teamOf(s) === "正方"
              return (
                <label
                  key={s}
                  className={`hud-clip-sm border px-2 py-3 text-center text-sm transition-all ${
                    locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  } ${
                    active
                      ? isAff
                        ? "border-aff bg-aff/25"
                        : "border-neg-lit bg-neg/40"
                      : "border-panel-edge text-muted hover:border-violet/60 hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="speaker"
                    value={s}
                    checked={active}
                    disabled={locked}
                    onChange={() => setSpeaker(s)}
                    className="sr-only"
                  />
                  {s}
                </label>
              )
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={pending || locked}
          className="hud-clip-sm border border-violet bg-violet/25 px-6 py-4 font-mono text-sm tracking-[0.24em] uppercase transition-colors hover:bg-violet/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {locked ? "投票已关闭" : pending ? "Transmitting..." : "提交 / 修改投票"}
        </button>

        {state.status !== "idle" && (
          <div
            role="status"
            aria-live="polite"
            className={`hud-clip-sm border px-4 py-3 text-sm ${
              state.status === "success"
                ? "border-violet bg-violet/15 text-foreground"
                : "border-magenta bg-magenta/15 text-foreground"
            }`}
          >
            {state.message}
            {state.status === "unregistered" && (
              <>
                {" "}
                <a
                  href={REGISTRATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-magenta underline-offset-4 hover:text-magenta"
                >
                  前往注册表单
                </a>
              </>
            )}
          </div>
        )}
      </form>
    </HudPanel>
  )
}
