"use client"

import { EventType } from "@prisma/client"
import { useState } from "react"

import { CalendarEventForm } from "@/components/calendar/calendar-event-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CalendarEventDialog({
  event,
  defaultProjectId,
  projects,
  trigger,
}: {
  event?: {
    id: string
    title: string
    type: EventType
    description: string | null
    location: string | null
    startAt: Date
    endAt: Date | null
    projectId: string | null
  }
  defaultProjectId?: string
  projects: { id: string; name: string }[]
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Novo evento"}</DialogTitle>
          <DialogDescription>
            {event
              ? "Atualize as informações deste compromisso."
              : "Agende uma medição, instalação, visita ou entrega."}
          </DialogDescription>
        </DialogHeader>
        <CalendarEventForm
          event={event}
          defaultProjectId={defaultProjectId}
          projects={projects}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
