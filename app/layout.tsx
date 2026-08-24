import type { Metadata, Viewport } from "next"
import { Noto_Sans_SC, Orbitron } from "next/font/google"
import "./globals.css"

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  weight: ["300", "400", "500", "700"],
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
