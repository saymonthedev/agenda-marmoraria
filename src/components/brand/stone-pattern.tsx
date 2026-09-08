export function StonePattern({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <polygon points="0,0 420,0 180,260 0,180" fill="white" opacity="0.035" />
      <polygon points="420,0 800,0 800,320 560,180" fill="white" opacity="0.05" />
      <polygon points="180,260 420,0 560,180 340,420" fill="white" opacity="0.025" />
      <polygon points="0,180 180,260 340,420 60,520" fill="var(--accent)" opacity="0.09" />
      <polygon points="800,320 800,700 520,560 560,180" fill="white" opacity="0.03" />
      <polygon points="340,420 560,180 520,560 220,640" fill="white" opacity="0.045" />
      <polygon points="60,520 340,420 220,640 0,760" fill="white" opacity="0.03" />
      <polygon points="0,760 220,640 520,560 800,700 800,900 0,900" fill="white" opacity="0.02" />
      <polygon points="520,560 800,700 620,900 300,900 220,640" fill="var(--accent)" opacity="0.06" />
    </svg>
  )
}
