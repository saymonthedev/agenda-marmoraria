import { Permission, Priority, ProjectStage } from "@prisma/client"
import type { Metadata } from "next"
import Link from "next/link"
import { FolderKanban, Kanban, Plus } from "lucide-react"

import { ProjectFilters } from "@/components/projects/project-filters"
import { ProjectRowActions } from "@/components/projects/project-row-actions"
import { PriorityBadge, StageBadge } from "@/components/shared/badges"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { formatDate, isDueSoon, isOverdue } from "@/lib/dates"
import { listProjects, listResponsibleCandidates } from "@/server/queries/projects"
import { getSettings } from "@/server/queries/settings"

export const metadata: Metadata = { title: "Projetos" }

function ProjectSituation({
  stage,
  deadline,
  dueSoonDays,
}: {
  stage: ProjectStage
  deadline: Date | null
  dueSoonDays: number
}) {
  if (stage === ProjectStage.CONCLUIDO) {
    return <span className="text-xs font-medium text-success">Concluído</span>
  }
  if (stage === ProjectStage.CANCELADO) {
    return <span className="text-xs font-medium text-muted-foreground">Cancelado</span>
  }
  if (isOverdue(deadline)) {
    return <span className="text-xs font-medium text-destructive">Atrasado</span>
  }
  if (isDueSoon(deadline, dueSoonDays)) {
    return <span className="text-xs font-medium text-warning">Prazo próximo</span>
  }
  return <span className="text-xs text-muted-foreground">No prazo</span>
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    stage?: ProjectStage
    priority?: Priority
    responsibleId?: string
  }>
}) {
  const user = await requireUser()
  const filters = await searchParams

  const [projects, responsibleCandidates, settings] = await Promise.all([
    listProjects(user, filters),
    listResponsibleCandidates(),
    getSettings(),
  ])

  const admin = isAdmin(user)
  const canCreate = admin || hasPermission(user, Permission.PROJECTS_CREATE)
  const canEdit = admin || hasPermission(user, Permission.PROJECTS_EDIT)
  const canDelete = admin || hasPermission(user, Permission.PROJECTS_DELETE)
  const hasFilters = Boolean(filters.q || filters.stage || filters.priority || filters.responsibleId)

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <PageHeader
        title="Projetos"
        description="Todos os serviços em andamento e concluídos da marmoraria."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/kanban">
                <Kanban className="size-4" />
                Kanban
              </Link>
            </Button>
            {canCreate && (
              <Button asChild>
                <Link href="/projetos/novo">
                  <Plus className="size-4" />
                  Novo projeto
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Pesquisar por projeto ou cliente..." />
        <ProjectFilters responsibleOptions={responsibleCandidates} />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={hasFilters ? "Nenhum projeto encontrado" : "Nenhum projeto cadastrado"}
          description={
            hasFilters
              ? "Ajuste os filtros ou a pesquisa para encontrar o que procura."
              : "Crie o primeiro projeto para começar a acompanhar o fluxo da marmoraria."
          }
          action={
            canCreate &&
            !hasFilters && (
              <Button asChild>
                <Link href="/projetos/novo">
                  <Plus className="size-4" />
                  Novo projeto
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="hidden lg:table-cell">Responsável</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="hidden sm:table-cell">Prioridade</TableHead>
                <TableHead className="hidden sm:table-cell">Prazo</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link href={`/projetos/${project.id}`} className="hover:text-accent hover:underline">
                      {project.name}
                    </Link>
                    <p className="text-xs text-muted-foreground md:hidden">{project.customer.name}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {project.customer.name}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {project.responsible?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={project.stage} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <PriorityBadge priority={project.priority} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {project.deadline ? formatDate(project.deadline) : "—"}
                  </TableCell>
                  <TableCell>
                    <ProjectSituation
                      stage={project.stage}
                      deadline={project.deadline}
                      dueSoonDays={settings.dueSoonDays}
                    />
                  </TableCell>
                  <TableCell>
                    <ProjectRowActions
                      projectId={project.id}
                      projectName={project.name}
                      active={project.active}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canHardDelete={admin}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
