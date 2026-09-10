import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"

import { ChangePasswordDialog } from "@/components/account/change-password-dialog"
import { StonePattern } from "@/components/brand/stone-pattern"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { isAdmin, requireUser } from "@/lib/authorization"
import { USER_ROLE_LABELS } from "@/lib/labels"
import { PERMISSION_LABELS } from "@/lib/permissions"

export const metadata: Metadata = { title: "Minha conta" }

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  )
}

export default async function AccountPage() {
  const user = await requireUser()
  const admin = isAdmin(user)

  return (
    <div className="animate-in fade-in-0 mx-auto max-w-3xl space-y-6 duration-300">
      {/* Banner de identidade com a textura de pedra da marca */}
      <section className="relative overflow-hidden rounded-2xl bg-sidebar text-sidebar-foreground ring-1 ring-foreground/10">
        <StonePattern className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="relative z-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <Avatar className="size-16 shrink-0 ring-2 ring-white/15">
            <AvatarFallback className="bg-accent text-xl font-medium text-accent-foreground">
              {getInitials(user.name ?? user.email ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="space-y-0.5">
              <h1 className="font-heading text-2xl leading-tight font-medium">{user.name}</h1>
              <p className="text-sm text-sidebar-foreground/70">{user.email}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium tracking-wide text-sidebar-foreground ring-1 ring-white/15">
              {USER_ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      </section>

      {/* Resumo de acesso */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="size-5 text-accent" />
          <h2 className="font-heading text-lg font-medium">Acesso ao sistema</h2>
        </div>

        {admin ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Você é <span className="font-medium text-foreground">administrador</span> e tem acesso
            completo: gestão de usuários, clientes, projetos, agenda, histórico e configurações do
            sistema.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Como colaborador, seu acesso é definido pela administração. Você pode:
            </p>
            {user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="font-normal">
                    {PERMISSION_LABELS[permission]}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma permissão específica foi atribuída ainda. Fale com a administração se
                precisar de acesso a mais áreas.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Senha e segurança */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md space-y-1">
            <h2 className="font-heading text-lg font-medium">Senha e segurança</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Use uma senha exclusiva para este sistema, com pelo menos 8 caracteres. A alteração
              abre em uma janela.
            </p>
          </div>
          <div className="shrink-0">
            <ChangePasswordDialog />
          </div>
        </div>
      </section>
    </div>
  )
}
