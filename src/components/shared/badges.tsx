import { EventType, Priority, ProjectStage, TaskStatus } from "@prisma/client"
import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { isOverdue } from "@/lib/dates"
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_STYLES,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  PROJECT_STAGE_LABELS,
  PROJECT_STAGE_STYLES,
  TASK_STATUS_LABELS,
  TASK_STATUS_STYLES,
} from "@/lib/labels"
import { cn } from "@/lib/utils"

export function StageBadge({ stage, className }: { stage: ProjectStage; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", PROJECT_STAGE_STYLES[stage], className)}
    >
      {PROJECT_STAGE_LABELS[stage]}
    </Badge>
  )
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", PRIORITY_STYLES[priority], className)}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", TASK_STATUS_STYLES[status], className)}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}

export function EventTypeBadge({ type, className }: { type: EventType; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", EVENT_TYPE_STYLES[type], className)}>
      {EVENT_TYPE_LABELS[type]}
    </Badge>
  )
}

export function OverdueBadge({
  deadline,
  className,
}: {
  deadline: Date | string | null | undefined
  className?: string
}) {
  if (!isOverdue(deadline)) return null

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-destructive/30 bg-destructive/10 font-normal text-destructive", className)}
    >
      <AlertTriangle className="size-3" />
      Atrasado
    </Badge>
  )
}
