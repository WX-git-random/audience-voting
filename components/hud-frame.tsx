/**
 * The full-bleed HUD chrome: hexagonal circuit backdrop, magenta bracket in the
 * top-left / bottom-left, violet bracket in the bottom-right, and the striped
 * indicator bar in the top-right — mirroring the reference art.
 */
export function HudFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="hud-grid relative min-h-screen overflow-hidden">
      {/* Hexagonal circuit mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60 mix-blend-screen"
        style={{ backgroundImage: "url(/hex-mesh.png)" }}
      />
      {/* Darken the top-left so the mesh fades out, as in the brief */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 75% at 0% 0%, #000000 0%, rgba(0,0,0,0.85) 30%, transparent 70%)",
        }}
      />

      {/* Top-left magenta circuit bracket */}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-64 w-72 text-magenta">
        <div className="absolute left-6 top-6 h-px w-56 bg-current opacity-80" />
        <div className="absolute left-6 top-6 h-40 w-px bg-current opacity-80" />
        <div className="absolute left-12 top-14 h-px w-36 bg-current opacity-50" />
        <div className="absolute left-12 top-14 h-24 w-px bg-current opacity-50" />
        <div className="absolute left-[74px] top-[86px] h-16 w-px bg-current opacity-40" />
        <span className="absolute left-[18px] top-[18px] size-2 rounded-full bg-current" />
        <span className="absolute left-[236px] top-[22px] size-1.5 rounded-full bg-current" />
        <span className="absolute left-[70px] top-[142px] size-1.5 rounded-full bg-current" />
      </div>

      {/* Bottom-left magenta bracket with striped bar */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-72 w-80 text-magenta">
        <div className="absolute bottom-14 left-6 top-8 w-1.5 bg-current opacity-90" />
        <div className="absolute bottom-14 left-6 h-1.5 w-40 bg-current opacity-90" />
        <div className="hud-stripes absolute bottom-4 left-14 h-7 w-44 opacity-70" />
        <div className="hud-stripes absolute left-8 top-12 h-24 w-6 opacity-60" />
      </div>

      {/* Bottom-right violet bracket with striped bar */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-72 w-96 text-violet">
        <div className="absolute bottom-16 right-6 top-6 w-px bg-current opacity-70" />
        <div className="absolute bottom-16 left-24 right-6 h-px bg-current opacity-70" />
        <div className="hud-stripes absolute bottom-4 left-6 h-6 w-32 opacity-70" />
        <div className="hud-stripes absolute right-10 top-8 h-24 w-5 opacity-60" />
        <div
          className="absolute bottom-20 right-16 size-16 bg-current opacity-80"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        />
        <span className="absolute bottom-[52px] right-[300px] size-1.5 rounded-full bg-current" />
      </div>

      {/* Top-right striped status bar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-6 flex h-8 w-64 items-center gap-1 border border-violet/70 px-1"
      >
        <div className="hud-stripes h-5 flex-1 text-violet opacity-90" />
        <div className="hud-stripes h-5 w-14 text-magenta opacity-70" />
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}

/** An angular panel with a glowing edge — the repeating content container. */
export function HudPanel({
  children,
  className = "",
  accent = "violet",
}: {
  children: React.ReactNode
  className?: string
  accent?: "violet" | "magenta"
}) {
  const edge = accent === "violet" ? "border-violet/40" : "border-magenta/40"
  return (
    <section
      className={`hud-clip relative border ${edge} bg-panel/70 backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  )
}

/** Monospaced HUD section label with a leading tick. */
export function HudLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-1 bg-magenta" />
      <span className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">{children}</span>
    </div>
  )
}
