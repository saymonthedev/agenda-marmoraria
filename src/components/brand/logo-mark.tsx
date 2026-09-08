type LogoMarkProps = {
  className?: string
}

/**
 * Símbolo da marca Lithos: um hexágono facetado, referência a um bloco de
 * pedra cortado e polido. As três faces evocam o processo de corte e
 * acabamento — o ofício central de uma marmoraria.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M50 52 L12 30 L50 8 L88 30 Z" className="fill-accent" />
      <path d="M50 52 L88 30 L88 74 L50 96 Z" fill="currentColor" />
      <path d="M50 52 L50 96 L12 74 L12 30 Z" fill="currentColor" opacity="0.6" />
      <path
        d="M50 8 L88 30 L88 74 L50 96 L12 74 L12 30 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
