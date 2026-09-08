import { Permission, ProjectStage } from "@prisma/client"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarPlus, MapPin } from "lucide-react"

import { CalendarEventDialog } from "@/components/calendar/calendar-event-dialog"
import { EventTypeBadge } from "@/components/shared/badges"
import { HistoryTimeline } from "@/components/history/history-timeline"
import { NotesPanel } from "@/components/notes/notes-panel"
import { ProjectHeaderActions } from "@/components/projects/project-header-actions"
import {
  DeadlineQuickField,
  PriorityQuickSelect,
  ResponsibleQuickSelect,
  StageQuickSelect,
} from "@/components/projects/project-quick-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/tasks/task-list"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { formatDateTime } from "@/lib/dates"
import { PROJECT_STAGE_ORDER, PROJECT_TYPE_LABELS } from "@/lib/labels"
import { getProjectById, listResponsibleCandidates } from "@/server/queries/projects"

export const metadata: Metadata = { title: "Detalhes do projeto" }

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params

  const [project, candidates] = await Promise.all([
    getProjectById(user, id),
    listResponsibleCandidates(),
  ])

  if (!project) notFound()

  const admin = isAdmin(user)
  const canEdit = admin || hasPermission(user, Permission.PROJECTS_EDIT)
  const canChangeStage = admin || hasPermission(user, Permission.PROJECTS_CHANGE_STAGE)
  const canManageTasks = admin || hasPermission(user, Permission.TASKS_MANAGE)
  const canDelete = admin || hasPermission(user, Permission.PROJECTS_DELETE)
  const canManageAgenda = admin || hasPermission(user, Permission.AGENDA_MANAGE)

  const stageIndex = PROJECT_STAGE_ORDER.indexOf(project.stage)
  const progressPercent =
    project.stage === ProjectStage.CANCELADO
      ? 100
      : Math.round(((stageIndex + 1) / PROJECT_STAGE_ORDER.length) * 100)

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <Link
        href="/projetos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para projetos
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-medium text-foreground">{project.name}</h1>
            {!project.active && (
              <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                Desativado
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {PROJECT_TYPE_LABELS[project.type]} ·{" "}
            <Link href={`/clientes/${project.customer.id}`} className="hover:text-accent hover:underline">
              {project.customer.name}
            </Link>
          </p>
        </div>

        <ProjectHeaderActions
          projectId={project.id}
          active={project.active}
          canEdit={canEdit}
          canDelete={canDelete}
          canHardDelete={admin}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Progresso
          </span>
          <span className="text-xs font-medium text-foreground">
            {project.stage === ProjectStage.CANCELADO ? "Cancelado" : `${progressPercent}%`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={
              project.stage === ProjectStage.CANCELADO
                ? "h-full rounded-full bg-destructive/60 transition-all duration-500"
                : "h-full rounded-full bg-accent transition-all duration-500"
            }
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Etapa</p>
            <StageQuickSelect projectId={project.id} stage={project.stage} canEdit={canChangeStage} />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Prioridade
            </p>
            <PriorityQuickSelect projectId={project.id} priority={project.priority} canEdit={canEdit} />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Responsável
            </p>
            <ResponsibleQuickSelect
              projectId={project.id}
              responsibleId={project.responsibleId}
              candidates={candidates}
              canEdit={canEdit}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Prazo</p>
            <DeadlineQuickField projectId={project.id} deadline={project.deadline} canEdit={canEdit} />
          </div>
        </div>

        {project.description && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Descrição
            </p>
            <p className="mt-1.5 text-sm whitespace-pre-wrap text-foreground">{project.description}</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="tarefas">
        <TabsList>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="tarefas" className="pt-4">
          <TaskList
            projectId={project.id}
            tasks={project.tasks}
            candidates={candidates}
            canManage={canManageTasks}
          />
        </TabsContent>

        <TabsContent value="observacoes" className="pt-4">
          <NotesPanel
            projectId={project.id}
            notes={project.notes}
            currentUserId={user.id}
            isAdmin={admin}
          />
        </TabsContent>

        <TabsContent value="agenda" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-medium">
                Compromissos deste projeto ({project.events.length})
              </h2>
              {canManageAgenda && (
                <CalendarEventDialog
                  defaultProjectId={project.id}
                  projects={[{ id: project.id, name: project.name }]}
                  trigger={
                    <Button size="sm">
                      <CalendarPlus className="size-4" />
                      Novo evento
                    </Button>
                  }
                />
              )}
            </div>

            {project.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum compromisso agendado para este projeto.
              </p>
            ) : (
              <ul className="space-y-3">
                {project.events.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <EventTypeBadge type={event.type} />
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(event.startAt)}
                      </p>
                      {event.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="pt-4">
          <HistoryTimeline entries={project.history} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
