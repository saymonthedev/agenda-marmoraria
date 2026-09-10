import { cn } from "@/lib/utils"

/**
 * Loader temático da marmoraria: em um ciclo curto, um martelo bate no bloco,
 * a peça é medida e, por fim, fica pronta (selo com check).
 *
 * É um SVG inline animado apenas com `transform` e `opacity` (amigável à GPU),
 * sem bibliotecas nem imagens — leve para o navegador. Respeita
 * `prefers-reduced-motion`: sem animação, mostra a peça pronta.
 */
export function StoneLoader({
  className,
  label,
}: {
  className?: string
  label?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 text-accent", className)}>
      <svg
        className="stone-loader size-20"
        viewBox="0 0 120 120"
        fill="none"
        role="img"
        aria-label={label ?? "Carregando"}
      >
        {/* Bloco/peça de pedra — base sempre visível */}
        <g>
          <rect
            x="26"
            y="74"
            width="68"
            height="18"
            rx="3.5"
            fill="color-mix(in oklch, var(--accent) 16%, transparent)"
            stroke="color-mix(in oklch, var(--accent) 45%, transparent)"
            strokeWidth="1.5"
          />
          <line
            x1="30"
            y1="79"
            x2="90"
            y2="79"
            stroke="color-mix(in oklch, white 22%, transparent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Fase 1 — martelo batendo */}
        <g className="loader-hammer">
          <g>
            <rect x="43" y="45" width="34" height="7" rx="3.5" fill="currentColor" opacity="0.55" />
            <rect x="38" y="35" width="13" height="24" rx="3" fill="currentColor" />
          </g>
        </g>
        {/* Lascas no impacto */}
        <g className="loader-chips">
          <line x1="56" y1="70" x2="50" y2="63" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="70" x2="60" y2="61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="64" y1="70" x2="70" y2="63" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Fase 2 — medição */}
        <g className="loader-measure">
          <line x1="34" y1="64" x2="34" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="86" y1="64" x2="86" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line
            className="loader-measure-line"
            x1="34"
            y1="68"
            x2="86"
            y2="68"
            pathLength={1}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
            <line x1="46" y1="65" x2="46" y2="71" />
            <line x1="60" y1="64" x2="60" y2="72" />
            <line x1="74" y1="65" x2="74" y2="71" />
          </g>
        </g>

        {/* Fase 3 — peça pronta */}
        <g className="loader-ready">
          <circle cx="60" cy="56" r="15" fill="var(--accent)" opacity="0.14" />
          <circle cx="60" cy="56" r="15" stroke="currentColor" strokeWidth="2.5" />
          <path
            className="loader-check"
            d="M53 56.5 L58 61.5 L68 50.5"
            pathLength={1}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {label ? (
        <p className="text-sm font-medium tracking-wide text-muted-foreground">{label}</p>
      ) : null}
    </div>
  )
}
