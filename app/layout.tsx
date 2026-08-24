import type { Metadata, Viewport } from "next"
import { Noto_Sans_SC, Orbitron } from "next/font/google"
import "./globals.css"

// `subsets` is deliberately omitted: next/font only types the Latin-ish
// subsets for this family, so naming a CJK subset fails the production type
// check. Omitting it fetches every unicode range (including CJK), which is
// what actually renders the Chinese glyphs. `preload: false` is REQUIRED
// here — without a subset, preloading the full CJK font is rejected.
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "700", "900"],
})

export const metadata: Metadata = {
  title: "实时辩论投票系统 | LIVE DEBATE POLL",
  description: "实时可改票的辩论投票系统 — 支持正反方投票与最佳辩手评选。",
}

export const viewport: Viewport = {
  themeColor: "#07020e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`bg-background ${notoSansSC.variable} ${orbitron.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
