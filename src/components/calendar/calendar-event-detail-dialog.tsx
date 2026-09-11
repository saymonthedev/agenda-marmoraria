"use client"

import { EventType } from "@prisma/client"
import { CalendarClock, FolderOpen, MapPin, Pencil, Trash2, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactElement, ReactNode } from "react"
import { useState } from "react"
import { toast } from "sonner"

import { CalendarEventDialog } from "@/components/calendar/calendar-event-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EventTypeBadge } from "@/components/shared/badges"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDate, formatTime } from "@/lib/dates"
import { deleteCalendarEvent } from "@/server/actions/calendar"

type EventDetail = {
  id: string
  title: string
  type: EventType
  description: string | null
  location: string | null
  startAt: Date
  endAt: Date | null
  projectId: string | null
  project?: { id: string; name: string } | null
  createdBy?: { id: string; name: string } | null
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  )
}

export function CalendarEventDetailDialog({
  event,
  canManage,
  trigger,
}: {
  event: EventDetail
  canManage: boolean
  trigger: ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const timeLabel = `${formatDate(event.startAt)} · ${formatTime(event.startAt)}${
    event.endAt ? ` às ${formatTime(event.endAt)}` : ""
  }`

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="pr-6">{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <EventTypeBadge type={event.type} />

            <div className="space-y-3">
              <DetailRow icon={CalendarClock} label="Quando">
                <span className="capitalize">{timeLabel}</span>
              </DetailRow>

              {event.location && (
                <DetailRow icon={MapPin} label="Local">
                  {event.location}
                </DetailRow>
              )}

              {event.project && (
                <DetailRow icon={FolderOpen} label="Projeto">
                  <Link
                    href={`/projetos/${event.project.id}`}
                    className="text-accent hover:underline"
                  >
                    {event.project.name}
                  </Link>
                </DetailRow>
              )}

              {event.createdBy && (
                <DetailRow icon={User} label="Criado por">
                  {event.createdBy.name}
                </DetailRow>
              )}
            </div>

            {event.description && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap text-foreground">
                {event.description}
              </div>
            )}
          </div>

          {canManage ? (
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
              <CalendarEventDialog
                event={event}
                projects={event.project ? [event.project] : []}
                tooltip="Editar evento"
                trigger={
                  <Button type="button" variant="outline" className="gap-2">
                    <Pencil className="size-4" />
                    Editar
                  </Button>
                }
              />
            </DialogFooter>
          ) : (
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

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
          setOpen(false)
          router.refresh()
        }}
      />
    </>
  )
}
