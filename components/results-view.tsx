"use client"

import { SPEAKERS, TEAMS, teamOf, type Speaker, type Team } from "@/lib/vote-config"
import { HudLabel, HudPanel } from "@/components/hud-frame"
import useSWR from "swr"

type Results = {
  total: number
  teamCounts: Record<Team, number>
  speakerCounts: Record<Speaker, number>
  locked?: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<Results>)

/**
 * Projector / LED-wall tally. Everything is sized in viewport units so the
 * numbers fill whatever the auditorium screen happens to be, and the whole
 * thing is a single flex column that stretches to the available height rather
 * than a fixed-width centered column.
 */
export function ResultsView({ initial }: { initial: Results }) {
  const { data } = useSWR<Results>("/api/results", fetcher, {
    fallbackData: initial,
    refreshInterval: 4000,
    revalidateOnFocus: true,
  })

  const results = data ?? initial
  const { total, teamCounts, speakerCounts } = results

  const maxSpeaker = Math.max(1, ...SPEAKERS.map((s) => speakerCounts[s] ?? 0))
  // Sort by count desc, then by the fixed SPEAKERS order so equal counts keep a
  // stable position instead of jumping around on every 4s refresh.
  const topSpeakers = [...SPEAKERS]
    .sort(
      (a, b) =>
        (speakerCounts[b] ?? 0) - (speakerCounts[a] ?? 0) ||
        SPEAKERS.indexOf(a) - SPEAKERS.indexOf(b),
    )
    .slice(0, 3)

  // The split bar uses the exact ratio, but the two big numbers must be rounded
  // in a way that always sums to exactly 100 — rounding each side on its own
  // gives 51% / 50% for a 50.5 / 49.5 split. Round 正方, then derive 反方.
  const affPct = total > 0 ? ((teamCounts["正方"] ?? 0) / total) * 100 : 50
  const affDisplay = Math.round(affPct)
  const displayPct: Record<Team, number> = { 正方: affDisplay, 反方: 100 - affDisplay }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[1.4vh]">
      {/* Team split */}
      <HudPanel className="flex min-h-0 flex-1 flex-col p-[min(2.2vw,2.4vh)]">
        <div className="flex min-h-0 flex-1 flex-col gap-[1.2vh]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <HudLabel>Team Split / 阵营得票</HudLabel>
            <span className="font-mono text-[clamp(0.75rem,1.1vw,1.4rem)] tracking-[0.2em] text-muted">
              TOTAL {String(total).padStart(3, "0")}
            </span>
          </div>

          {total === 0 ? (
            <p className="flex flex-1 items-center justify-center font-mono text-[clamp(1rem,2vw,2rem)] tracking-widest text-muted">
              {"// 暂无投票数据"}
            </p>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 items-center justify-center gap-[4vw] overflow-hidden">
                {TEAMS.map((team) => {
                  const count = teamCounts[team] ?? 0
                  const isAff = team === "正方"
                  return (
                    <div key={team} className="flex min-w-0 flex-col items-center gap-[0.4vh]">
                      <span
                        className={`font-mono font-bold leading-none tabular-nums text-[min(10.5vw,13vh)] ${
                          isAff ? "text-aff text-glow-aff" : "text-neg-lit text-glow-neg"
                        }`}
                      >
                        {displayPct[team]}
                        <span className="text-[0.35em]">%</span>
                      </span>
                      <span className="font-display font-black leading-tight tracking-[0.06em] text-[min(3.2vw,4.4vh)]">
                        {team}
                      </span>
                      <span className="font-mono leading-tight tracking-[0.2em] text-muted text-[min(1.5vw,2.2vh)]">
                        {count} 票
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Single split bar instead of a pie — far more readable */}
              <div className="hud-clip-sm flex h-[3vh] min-h-4 w-full shrink-0 overflow-hidden border border-panel-edge">
                <div
                  className="bg-aff transition-all duration-700 ease-out"
                  style={{ width: `${affPct}%` }}
                />
                <div className="flex-1 bg-neg transition-all duration-700 ease-out" />
              </div>
            </>
          )}
        </div>
      </HudPanel>

      {/* Best debater */}
      <HudPanel accent="magenta" className="flex min-h-0 flex-1 flex-col p-[min(2.2vw,2.4vh)]">
        <div className="flex min-h-0 flex-1 flex-col gap-[1.2vh]">
          <HudLabel>Best Debater · Top 3 / 最佳辩手 前三名</HudLabel>

          {total === 0 ? (
            <p className="flex flex-1 items-center justify-center font-mono text-[clamp(1rem,2vw,2rem)] tracking-widest text-muted">
              {"// 暂无投票数据"}
            </p>
          ) : (
            <ul className="flex min-h-0 flex-1 flex-col justify-center gap-[1.4vh] overflow-hidden">
              {topSpeakers.map((speaker, i) => {
                const count = speakerCounts[speaker] ?? 0
                const isAff = teamOf(speaker) === "正方"
                const isFirst = i === 0
                return (
                  <li key={speaker} className="flex min-h-0 items-center gap-[1.6vw]">
                    <span
                      className={`shrink-0 font-mono font-bold leading-none tabular-nums ${
                        isFirst
                          ? "text-[min(3.6vw,5vh)] text-magenta text-glow-magenta"
                          : "text-[min(2.2vw,3.2vh)] text-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-[0.5vh]">
                      <div className="flex items-baseline justify-between gap-4">
                        <span
                          className={`truncate font-display leading-tight tracking-[0.04em] ${
                            isFirst ? "text-[min(2.8vw,3.8vh)] font-black" : "text-[min(2vw,2.8vh)] font-bold"
                          }`}
                        >
                          {speaker}
                        </span>
                        <span
                          className={`shrink-0 font-mono leading-tight tabular-nums ${
                            isFirst ? "text-[min(2.8vw,3.8vh)] font-bold" : "text-[min(2vw,2.8vh)]"
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                      <div
                        className={`w-full shrink-0 bg-panel-edge/30 ${isFirst ? "h-[2vh] min-h-3" : "h-[1.4vh] min-h-2"}`}
                      >
                        <div
                          className={`h-full transition-all duration-700 ease-out ${
                            isAff ? "bg-aff" : "bg-neg"
                          }`}
                          style={{ width: `${(count / maxSpeaker) * 100}%` }}
                        />
                      </div>
                    </div>
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
