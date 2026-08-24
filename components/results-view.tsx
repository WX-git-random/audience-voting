"use client"

import { SPEAKERS, TEAMS, teamOf, type Speaker, type Team } from "@/lib/vote-config"
import { HudLabel, HudPanel } from "@/components/hud-frame"
import useSWR from "swr"

type Results = {
  total: number
  teamCounts: Record<Team, number>
  speakerCounts: Record<Speaker, number>
}

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<Results>)

export function ResultsView({ initial }: { initial: Results }) {
  const { data } = useSWR<Results>("/api/results", fetcher, {
    fallbackData: initial,
    refreshInterval: 4000,
    revalidateOnFocus: true,
  })

  const results = data ?? initial
  const { total, teamCounts, speakerCounts } = results

  const maxSpeaker = Math.max(1, ...SPEAKERS.map((s) => speakerCounts[s] ?? 0))
  const rankedSpeakers = [...SPEAKERS].sort((a, b) => (speakerCounts[b] ?? 0) - (speakerCounts[a] ?? 0))

  return (
    <div className="flex flex-col gap-6">
      {/* Team split */}
      <HudPanel className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <HudLabel>Team Split / 阵营得票</HudLabel>
            <span className="font-mono text-xs tracking-[0.2em] text-muted">
              TOTAL {String(total).padStart(3, "0")}
            </span>
          </div>

          {total === 0 ? (
            <p className="font-mono text-sm tracking-widest text-muted">// 暂无投票数据</p>
          ) : (
            <>
              <div className="flex items-end justify-center gap-10 md:gap-20">
                {TEAMS.map((team) => {
                  const count = teamCounts[team] ?? 0
                  const pct = total > 0 ? (count / total) * 100 : 0
                  const isAff = team === "正方"
                  return (
                    <div key={team} className="flex flex-col items-center gap-2">
                      <span
                        className={`font-mono text-5xl font-bold md:text-6xl ${
                          isAff ? "text-aff text-glow-aff" : "text-neg-lit text-glow-neg"
                        }`}
                      >
                        {pct.toFixed(0)}
                        <span className="text-2xl">%</span>
                      </span>
                      <span className="font-display text-xl font-black tracking-[0.06em]">{team}</span>
                      <span className="font-mono text-xs tracking-[0.2em] text-muted">{count} 票</span>
                    </div>
                  )
                })}
              </div>

              {/* Single split bar instead of a pie — far more readable */}
              <div className="hud-clip-sm flex h-8 w-full overflow-hidden border border-panel-edge">
                <div
                  className="flex items-center justify-end bg-aff transition-all duration-700 ease-out"
                  style={{ width: `${total > 0 ? ((teamCounts["正方"] ?? 0) / total) * 100 : 50}%` }}
                />
                <div className="flex-1 bg-neg transition-all duration-700 ease-out" />
              </div>
            </>
          )}
        </div>
      </HudPanel>

      {/* Best debater */}
      <HudPanel accent="magenta" className="p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <HudLabel>Best Debater / 最佳辩手</HudLabel>

          {total === 0 ? (
            <p className="font-mono text-sm tracking-widest text-muted">// 暂无投票数据</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rankedSpeakers.map((speaker, i) => {
                const count = speakerCounts[speaker] ?? 0
                const isAff = teamOf(speaker) === "正方"
                return (
                  <li key={speaker} className="flex items-center gap-3">
                    <span className="w-6 font-mono text-[11px] text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="w-24 shrink-0 text-sm">{speaker}</span>
                    <div className="h-5 flex-1 bg-panel-edge/30">
                      <div
                        className={`h-full transition-all duration-700 ease-out ${
                          isAff ? "bg-aff" : "bg-neg"
                        }`}
                        style={{ width: `${(count / maxSpeaker) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-sm">{count}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </HudPanel>
    </div>
  )
}
