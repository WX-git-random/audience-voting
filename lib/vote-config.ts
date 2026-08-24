export const TEAMS = ["正方", "反方"] as const
export type Team = (typeof TEAMS)[number]

export const SPEAKERS = [
  "正方一辩",
  "正方二辩",
  "正方三辩",
  "正方四辩",
  "反方一辩",
  "反方二辩",
  "反方三辩",
  "反方四辩",
] as const
export type Speaker = (typeof SPEAKERS)[number]

export const REGISTRATION_URL = "https://forms.gle/eZh1wPnjPnmDbLvS9"

export function teamOf(speaker: string): Team {
  return speaker.includes("正方") ? "正方" : "反方"
}
