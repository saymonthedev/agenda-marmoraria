import { Permission } from "@prisma/client"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { PROJECT_STAGE_LABELS, PROJECT_STAGE_ORDER } from "@/lib/labels"
import { PERMISSION_DESCRIPTIONS, PERMISSION_GROUPS, PERMISSION_LABELS } from "@/lib/permissions"

export const metadata: Metadata = { title: "Configurações" }

export default async function SettingsPage() {
  const user = await requireUser()
  if (!isAdmin(user) && !hasPermission(user, Permission.SETTINGS_MANAGE)) {
    redirect("/dashboard")
  }

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <PageHeader
        title="Configurações"
        description="Referência das etapas de projeto e permissões disponíveis no sistema."
      />

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="font-heading text-lg font-medium">Fluxo de etapas dos projetos</h2>
          <p className="text-sm text-muted-foreground">
            Ordem padrão utilizada no Kanban e nas listagens de projetos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PROJECT_STAGE_ORDER.map((stage, index) => (
            <span key={stage} className="flex items-center gap-2">
              <Badge variant="outline">{PROJECT_STAGE_LABELS[stage]}</Badge>
              {index < PROJECT_STAGE_ORDER.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Projetos também podem ser marcados como &quot;Cancelado&quot; a partir de qualquer etapa.
        </p>
      </section>

      <section className="space-y-5 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="font-heading text-lg font-medium">Permissões de colaboradores</h2>
          <p className="text-sm text-muted-foreground">
            Use estas permissões ao criar ou editar um usuário do tipo colaborador em
            &quot;Usuários&quot;.
          </p>
        </div>
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {group.title}
            </p>
            <ul className="space-y-2">
              {group.permissions.map((permission) => (
                <li key={permission} className="text-sm">
                  <span className="font-medium text-foreground">{PERMISSION_LABELS[permission]}</span>
                  <span className="block text-xs text-muted-foreground">
                    {PERMISSION_DESCRIPTIONS[permission]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
