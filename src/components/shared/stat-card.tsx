import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
  className,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: "default" | "warning" | "destructive" | "success"
  hint?: string
  className?: string
}) {
  const toneStyles: Record<typeof tone, string> = {
    default: "bg-muted text-muted-foreground",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
    success: "bg-success/15 text-success",
  }

  return (
    <div
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-1 duration-300 flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <div className="space-y-1.5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-heading text-3xl font-medium text-foreground">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneStyles[tone])}>
        <Icon className="size-4.5" />
      </div>
    </div>
  )
}
