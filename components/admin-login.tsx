"use client"

import { useActionState } from "react"
import { Lock } from "lucide-react"
import { login, type AdminState } from "@/app/actions/admin"
import { HudPanel } from "./hud-frame"

export function AdminLogin() {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(login, {})

  return (
    <HudPanel accent="violet" className="mx-auto w-full max-w-md p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-violet" aria-hidden="true" />
          <h1 className="font-mono text-sm tracking-[0.24em] uppercase">Admin Access</h1>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <label htmlFor="password" className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            管理员密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="hud-clip-sm border border-panel-edge bg-background/60 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-violet"
          />

          {state.error ? (
            <p role="alert" className="hud-clip-sm border border-magenta/50 bg-magenta/10 px-4 py-3 text-sm">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="hud-clip-sm mt-1 border border-violet bg-violet/25 px-6 py-4 font-mono text-sm tracking-[0.24em] uppercase transition-colors hover:bg-violet/40 disabled:opacity-50"
          >
            {pending ? "验证中…" : "进入"}
          </button>
        </form>

        <p className="text-sm leading-relaxed text-muted">此页面仅供管理员使用，观众无需访问。</p>
      </div>
    </HudPanel>
  )
}
