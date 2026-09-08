import { Permission } from "@prisma/client"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { ProjectForm } from "@/components/projects/project-form"
import { PageHeader } from "@/components/shared/page-header"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { listCustomersForSelect } from "@/server/queries/customers"
import { getProjectById, listResponsibleCandidates } from "@/server/queries/projects"

export const metadata: Metadata = { title: "Editar projeto" }

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  if (!isAdmin(user) && !hasPermission(user, Permission.PROJECTS_EDIT)) {
    redirect("/projetos")
  }

  const { id } = await params
  const [project, customers, candidates] = await Promise.all([
    getProjectById(user, id),
    listCustomersForSelect(),
    listResponsibleCandidates(),
  ])

  if (!project) notFound()

  return (
    <div className="animate-in fade-in-0 duration-300 mx-auto max-w-3xl space-y-6">
      <PageHeader title="Editar projeto" description={project.name} />
      <div className="rounded-xl border border-border bg-card p-6">
        <ProjectForm
          project={project}
          customers={customers}
          responsibleCandidates={candidates}
          memberCandidates={candidates.filter((c) => c.role === "COLLABORATOR")}
        />
      </div>
    </div>
  )
}
