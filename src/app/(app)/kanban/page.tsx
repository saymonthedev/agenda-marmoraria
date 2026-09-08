import { Permission } from "@prisma/client"
import type { Metadata } from "next"

import { KanbanBoardClient } from "@/components/kanban/kanban-board-loader"
import { PageHeader } from "@/components/shared/page-header"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { listProjectsForKanban } from "@/server/queries/projects"

export const metadata: Metadata = { title: "Kanban" }

export default async function KanbanPage() {
  const user = await requireUser()
  const projects = await listProjectsForKanban(user)
  const canChangeStage = isAdmin(user) || hasPermission(user, Permission.PROJECTS_CHANGE_STAGE)

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <PageHeader
        title="Kanban"
        description={
          canChangeStage
            ? "Arraste os cartões entre as colunas para atualizar a etapa do projeto."
            : "Acompanhe visualmente a etapa de cada projeto."
        }
      />
      <KanbanBoardClient initialProjects={projects} canChangeStage={canChangeStage} />
    </div>
  )
}
