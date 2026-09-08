import type { Metadata } from "next"
import Link from "next/link"
import {
  AlarmClock,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Hammer,
} from "lucide-react"

import { PriorityBadge, StageBadge } from "@/components/shared/badges"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Badge } from "@/components/ui/badge"
import { requireUser } from "@/lib/authorization"
import { formatDate, formatRelative } from "@/lib/dates"
import { HISTORY_ACTION_LABELS, PROJECT_STAGE_LABELS, PROJECT_STAGE_ORDER } from "@/lib/labels"
import { getDashboardData } from "@/server/queries/dashboard"
import { listUpcomingEvents } from "@/server/queries/calendar"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const user = await requireUser()
  const [data, upcomingEvents] = await Promise.all([
    getDashboardData(user),
    listUpcomingEvents(user, 5),
  ])

  const maxStageCount = Math.max(1, ...PROJECT_STAGE_ORDER.map((s) => data.stageCounts[s] ?? 0))
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date())

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Hoje é ${today}. Aqui está o panorama da marmoraria.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Em andamento" value={data.inProgress} icon={Hammer} />
        <StatCard
          label="Atrasados"
          value={data.overdue}
          icon={AlarmClock}
          tone={data.overdue > 0 ? "destructive" : "default"}
        />
        <StatCard
          label="Próximos do prazo"
          value={data.dueSoon}
          icon={Clock}
          tone={data.dueSoon > 0 ? "warning" : "default"}
          hint="Nos próximos 5 dias"
        />
        <StatCard label="Concluídos" value={data.completedTotal} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-medium">Prioridade em aberto</h2>
              <Link href="/projetos?priority=ALTA" className="text-sm text-accent hover:underline">
                Ver todos
              </Link>
            </div>

            {data.highPriority.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Nenhum projeto de alta prioridade em aberto"
                description="Os projetos marcados como alta ou urgente aparecerão aqui."
              />
            ) : (
              <ul className="divide-y divide-border">
                {data.highPriority.map((project) => (
                  <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/projetos/${project.id}`}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {project.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {project.customer.name}
                          {project.responsible ? ` · ${project.responsible.name}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StageBadge stage={project.stage} />
                        <PriorityBadge priority={project.priority} />
                        {project.deadline && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(project.deadline)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-heading text-lg font-medium">Projetos por etapa</h2>
            <div className="space-y-3">
              {PROJECT_STAGE_ORDER.map((stage) => {
                const count = data.stageCounts[stage] ?? 0
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-muted-foreground">
                      {PROJECT_STAGE_LABELS[stage]}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${(count / maxStageCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-xs font-medium text-foreground">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-medium">Próximos compromissos</h2>
              <Link href="/agenda" className="text-sm text-accent hover:underline">
                Agenda
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum compromisso agendado.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <CalendarClock className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.startAt)}
                        {event.project ? ` · ${event.project.name}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-heading text-lg font-medium">Atividade recente</h2>
            {data.recentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
            ) : (
              <ul className="space-y-4">
                {data.recentHistory.map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal text-xs">
                        {HISTORY_ACTION_LABELS[entry.action]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(entry.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      <Link href={`/projetos/${entry.project.id}`} className="font-medium text-foreground hover:underline">
                        {entry.project.name}
                      </Link>{" "}
                      — {entry.description}
                      {entry.user ? ` (${entry.user.name})` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
