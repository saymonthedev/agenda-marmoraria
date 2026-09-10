import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

type Facet = {
  points: string
  fill: string
  opacity: number
  duration: number
  delay: number
}

/** Faces de um bloco de pedra cortado — cada uma reage à luz em ritmo próprio. */
const FACETS: Facet[] = [
  { points: "0,0 420,0 180,260 0,180", fill: "white", opacity: 0.035, duration: 15, delay: 0 },
  { points: "420,0 800,0 800,320 560,180", fill: "white", opacity: 0.05, duration: 19, delay: 2.5 },
  { points: "180,260 420,0 560,180 340,420", fill: "white", opacity: 0.028, duration: 17, delay: 5 },
  {
    points: "0,180 180,260 340,420 60,520",
    fill: "var(--accent)",
    opacity: 0.075,
    duration: 21,
    delay: 1.2,
  },
  { points: "800,320 800,700 520,560 560,180", fill: "white", opacity: 0.03, duration: 16, delay: 6.5 },
  { points: "340,420 560,180 520,560 220,640", fill: "white", opacity: 0.045, duration: 23, delay: 3.4 },
  { points: "60,520 340,420 220,640 0,760", fill: "white", opacity: 0.03, duration: 18, delay: 8 },
  {
    points: "0,760 220,640 520,560 800,700 800,900 0,900",
    fill: "white",
    opacity: 0.022,
    duration: 20,
    delay: 4.2,
  },
  {
    points: "520,560 800,700 620,900 300,900 220,640",
    fill: "var(--accent)",
    opacity: 0.055,
    duration: 25,
    delay: 7.1,
  },
]

/** Veios de mármore atravessando o bloco. */
const VEINS = [
  { d: "M -60 300 C 150 236, 268 384, 424 318 S 704 258, 880 344", duration: 24, delay: 0 },
  { d: "M -60 528 C 124 472, 302 608, 472 542 S 726 470, 880 566", duration: 29, delay: 3 },
  { d: "M -60 704 C 184 660, 286 786, 462 722 S 706 658, 880 742", duration: 26, delay: 6 },
]

export function StonePattern({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden", className)} aria-hidden="true">
      <svg
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {FACETS.map((facet) => (
          <polygon
            key={facet.points}
            points={facet.points}
            fill={facet.fill}
            className="animate-stone-facet"
            style={
              {
                "--facet-opacity": facet.opacity,
                "--facet-duration": `${facet.duration}s`,
                "--facet-delay": `${facet.delay}s`,
                opacity: facet.opacity,
              } as CSSProperties
            }
          />
        ))}

        <g>
          {VEINS.map((vein, index) => (
            <path
              key={vein.d}
              d={vein.d}
              stroke={index === 1 ? "var(--accent)" : "white"}
              strokeWidth={index === 1 ? 2.5 : 1.5}
              strokeLinecap="round"
              className="animate-stone-vein"
              style={
                {
                  "--vein-duration": `${vein.duration}s`,
                  "--vein-delay": `${vein.delay}s`,
                  opacity: 0.12,
                } as CSSProperties
              }
            />
          ))}
        </g>
      </svg>

      {/* Brilho que percorre a superfície, como luz sobre pedra polida. */}
      <div className="animate-stone-sweep absolute inset-y-0 -left-1/4 w-1/2" />
    </div>
  )
}
