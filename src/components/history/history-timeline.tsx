import { History } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDateTime } from "@/lib/dates"
import { HISTORY_ACTION_LABELS } from "@/lib/labels"
import type { HistoryAction } from "@prisma/client"

type HistoryEntry = {
  id: string
  action: HistoryAction
  description: string
  createdAt: Date
  user: { name: string } | null
}

export function HistoryTimeline({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nenhuma atividade registrada"
        description="As ações realizadas neste projeto aparecerão aqui automaticamente."
      />
    )
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < entries.length - 1 && (
            <span className="absolute top-2.5 left-[5px] h-full w-px bg-border" />
          )}
          <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-accent bg-background" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {HISTORY_ACTION_LABELS[entry.action]}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-foreground">{entry.description}</p>
            {entry.user && (
              <p className="text-xs text-muted-foreground">por {entry.user.name}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
