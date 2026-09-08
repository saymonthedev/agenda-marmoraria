"use client"

import { EventType } from "@prisma/client"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { CalendarEventDialog } from "@/components/calendar/calendar-event-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { deleteCalendarEvent } from "@/server/actions/calendar"

type EventForActions = {
  id: string
  title: string
  type: EventType
  description: string | null
  location: string | null
  startAt: Date
  endAt: Date | null
  projectId: string | null
}

export function AgendaEventActions({
  event,
  projects,
}: {
  event: EventForActions
  projects: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex shrink-0 items-center gap-1">
      <CalendarEventDialog
        event={event}
        projects={projects}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Editar evento">
            <Pencil className="size-3.5" />
          </Button>
        }
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Excluir evento"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-3.5" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir evento"
        description={`Tem certeza que deseja excluir o evento "${event.title}"?`}
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          const result = await deleteCalendarEvent(event.id)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Evento excluído.")
          router.refresh()
        }}
      />
    </div>
  )
}
