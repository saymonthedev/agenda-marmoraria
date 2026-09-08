import { Permission } from "@prisma/client"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ProjectForm } from "@/components/projects/project-form"
import { PageHeader } from "@/components/shared/page-header"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { listCustomersForSelect } from "@/server/queries/customers"
import { listResponsibleCandidates } from "@/server/queries/projects"

export const metadata: Metadata = { title: "Novo projeto" }

export default async function NewProjectPage() {
  const user = await requireUser()
  if (!isAdmin(user) && !hasPermission(user, Permission.PROJECTS_CREATE)) {
    redirect("/projetos")
  }

  const [customers, candidates] = await Promise.all([
    listCustomersForSelect(),
    listResponsibleCandidates(),
  ])

  return (
    <div className="animate-in fade-in-0 duration-300 mx-auto max-w-3xl space-y-6">
      <PageHeader title="Novo projeto" description="Cadastre um novo serviço para a marmoraria." />
      <div className="rounded-xl border border-border bg-card p-6">
        <ProjectForm
          customers={customers}
          responsibleCandidates={candidates}
          memberCandidates={candidates.filter((c) => c.role === "COLLABORATOR")}
        />
      </div>
    </div>
  )
}
