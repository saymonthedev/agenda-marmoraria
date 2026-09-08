import { cn } from "@/lib/utils"
import { LogoMark } from "@/components/brand/logo-mark"

type LogoProps = {
  className?: string
  markClassName?: string
  iconOnly?: boolean
}

export function Logo({ className, markClassName, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("size-7 shrink-0", markClassName)} />
      {!iconOnly && (
        <span className="font-heading text-xl font-medium tracking-wide">
          LITHOS
        </span>
      )}
    </div>
  )
}
