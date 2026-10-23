import { Permission } from "@prisma/client"
import { eachDayOfInterval, format, isSameMonth, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react"

import { CalendarEventDialog } from "@/components/calendar/calendar-event-dialog"
import { CalendarEventDetailDialog } from "@/components/calendar/calendar-event-detail-dialog"
import { AgendaEventActions } from "@/components/calendar/agenda-event-actions"
import { EventTypeBadge } from "@/components/shared/badges"
import { TooltipWrap } from "@/components/shared/tooltip-wrap"
import { Button } from "@/components/ui/button"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import {
  formatAgendaDateParam,
  formatAgendaTitle,
  getAgendaRange,
  parseAgendaDate,
  parseAgendaView,
  shiftAgendaDate,
  type AgendaView,
} from "@/lib/agenda-range"
import { formatTime } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { listCalendarEvents } from "@/server/queries/calendar"
import { listProjects } from "@/server/queries/projects"

export const metadata: Metadata = { title: "Agenda" }

const VIEW_LABELS: Record<AgendaView, string> = { dia: "Dia", semana: "Semana", mes: "Mês" }

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>
}) {
  const user = await requireUser()
  const params = await searchParams
  const view = parseAgendaView(params.view)
  const date = parseAgendaDate(params.date)
  const range = getAgendaRange(view, date)

  const [events, projects] = await Promise.all([
    listCalendarEvents(user, range),
    listProjects(user),
  ])

  const canManage = isAdmin(user) || hasPermission(user, Permission.AGENDA_MANAGE)

  const eventsByDay = new Map<string, typeof events>()
  for (const event of events) {
    const key = format(event.startAt, "yyyy-MM-dd")
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event])
  }

  const previousHref = `/agenda?view=${view}&date=${formatAgendaDateParam(shiftAgendaDate(view, date, -1))}`
  const nextHref = `/agenda?view=${view}&date=${formatAgendaDateParam(shiftAgendaDate(view, date, 1))}`
  const todayHref = `/agenda?view=${view}&date=${formatAgendaDateParam(new Date())}`

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground">{formatAgendaTitle(view, date)}</p>
        </div>
        {canManage && (
          <CalendarEventDialog
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            trigger={
              <Button>
                <Plus className="size-4" />
                Novo evento
              </Button>
            }
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(["dia", "semana", "mes"] as AgendaView[]).map((v) => (
            <Button
              key={v}
              variant={v === view ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href={`/agenda?view=${v}&date=${formatAgendaDateParam(date)}`}>
                {VIEW_LABELS[v]}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <TooltipWrap label="Período anterior">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={previousHref} aria-label="Período anterior">
                <ChevronLeft className="size-4" />
              </Link>
            </Button>
          </TooltipWrap>
          <Button variant="outline" size="sm" asChild>
            <Link href={todayHref}>Hoje</Link>
          </Button>
          <TooltipWrap label="Próximo período">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={nextHref} aria-label="Próximo período">
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </TooltipWrap>
        </div>
      </div>

      {view === "mes" ? (
        <MonthGrid
          range={range}
          referenceDate={date}
          eventsByDay={eventsByDay}
          canManage={canManage}
        />
      ) : (
        <DayList range={range} eventsByDay={eventsByDay} canManage={canManage} />
      )}
    </div>
  )
}

function MonthGrid({
  range,
  referenceDate,
  eventsByDay,
  canManage,
}: {
  range: { from: Date; to: Date }
  referenceDate: Date
  eventsByDay: Map<string, Awaited<ReturnType<typeof listCalendarEvents>>>
  canManage: boolean
}) {
  const days = eachDayOfInterval({ start: range.from, end: range.to })
  const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {weekdayLabels.map((label) => (
          <div key={label} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const dayEvents = eventsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, referenceDate)

          return (
            <div
              key={key}
              className={cn(
                "min-h-16 border-b border-r border-border p-1 last:border-r-0 sm:min-h-28 sm:p-2",
                !inMonth && "bg-muted/20"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs",
                  isToday(day) && "bg-accent text-accent-foreground font-medium",
                  !inMonth && "text-muted-foreground/50",
                  inMonth && !isToday(day) && "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>

              {/* Telas pequenas: pontinhos clicáveis que abrem os detalhes. */}
              {dayEvents.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                  {dayEvents.slice(0, 4).map((event) => (
                    <CalendarEventDetailDialog
                      key={event.id}
                      event={event}
                      canManage={canManage}
                      trigger={
                        <button
                          type="button"
                          aria-label={`${formatTime(event.startAt)} ${event.title}`}
                          className="flex size-4 cursor-pointer items-center justify-center rounded-full"
                        >
                          <span className="size-1.5 rounded-full bg-accent" />
                        </button>
                      }
                    />
                  ))}
                </div>
              )}

              {/* A partir de sm: chips com horário e título. Clicar abre os detalhes. */}
              <div className="mt-1 hidden space-y-1 sm:block">
                {dayEvents.slice(0, 3).map((event) => (
                  <CalendarEventDetailDialog
                    key={event.id}
                    event={event}
                    canManage={canManage}
                    trigger={
                      <button
                        type="button"
                        className="block w-full cursor-pointer truncate rounded-sm border border-border bg-background px-1.5 py-0.5 text-left text-[11px] text-foreground transition-colors hover:border-accent hover:bg-accent/5"
                        title={event.title}
                      >
                        {formatTime(event.startAt)} {event.title}
                      </button>
                    }
                  />
                ))}
                {dayEvents.length > 3 && (
                  <p className="px-1.5 text-[11px] text-muted-foreground">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayList({
  range,
  eventsByDay,
  canManage,
}: {
  range: { from: Date; to: Date }
  eventsByDay: Map<string, Awaited<ReturnType<typeof listCalendarEvents>>>
  canManage: boolean
}) {
  const days = eachDayOfInterval({ start: range.from, end: range.to })
  const isWeekView = days.length > 1

  return (
    <div
      className={cn(
        "grid gap-3",
        isWeekView
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
          : "mx-auto w-full max-w-2xl grid-cols-1"
      )}
    >
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd")
        const dayEvents = (eventsByDay.get(key) ?? []).sort(
          (a, b) => a.startAt.getTime() - b.startAt.getTime()
        )

        return (
          <div
            key={key}
            className={cn(
              "min-w-0 space-y-2 rounded-xl border border-border bg-card p-3",
              isToday(day) && "border-accent/40 bg-accent/5"
            )}
          >
            <p className={cn("text-sm font-medium capitalize", isToday(day) && "text-accent")}>
              {isWeekView
                ? format(day, "EEE, dd/MM", { locale: ptBR })
                : format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            {dayEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum compromisso.</p>
            ) : (
              <ul className="space-y-2">
                {dayEvents.map((event) => (
                  <li key={event.id} className="min-w-0 rounded-lg border border-border p-2.5">
                    {/* Horário e ações numa linha só: na semana a coluna é estreita e o
                        título precisa da largura inteira do cartão. */}
                    <div className="flex min-h-7 items-center justify-between gap-1">
                      <p className="text-xs font-medium text-muted-foreground tabular-nums">
                        {formatTime(event.startAt)}
                      </p>
                      {canManage && (
                        <AgendaEventActions
                          event={event}
                          projects={event.project ? [event.project] : []}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-3 text-sm leading-snug font-medium text-foreground">
                      {event.title}
                    </p>
                    <div className="mt-1.5">
                      <EventTypeBadge type={event.type} />
                    </div>
                    {event.location && (
                      <p className="mt-1.5 flex items-start gap-1 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 size-3 shrink-0" />
                        <span className="line-clamp-2">{event.location}</span>
                      </p>
                    )}
                    {event.project && (
                      <Link
                        href={`/projetos/${event.project.id}`}
                        className="mt-1 line-clamp-2 text-xs text-accent hover:underline"
                      >
                        {event.project.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
