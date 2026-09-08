import Image from "next/image"

import { LogoMark } from "@/components/brand/logo-mark"
import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return <LogoMark className={cn("size-6", className)} plateClassName="p-1.5" />
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-white px-3 py-2 ring-1 ring-black/5",
        className
      )}
    >
      <Image
        src="/logo-stainhaus.png"
        alt="Stainhaus Marmoraria"
        width={677}
        height={122}
        className="h-6 w-auto object-contain"
        priority
      />
    </span>
  )
}
