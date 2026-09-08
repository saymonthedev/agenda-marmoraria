import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { ChangePasswordForm } from "@/components/users/change-password-form"
import { requireUser } from "@/lib/authorization"
import { USER_ROLE_LABELS } from "@/lib/labels"

export const metadata: Metadata = { title: "Minha conta" }

export default async function AccountPage() {
  const user = await requireUser()

  return (
    <div className="animate-in fade-in-0 duration-300 mx-auto max-w-2xl space-y-6">
      <PageHeader title="Minha conta" description="Suas informações de acesso ao sistema." />

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant="outline">{USER_ROLE_LABELS[user.role]}</Badge>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="font-heading text-lg font-medium">Alterar senha</h2>
          <p className="text-sm text-muted-foreground">
            Recomendamos usar uma senha exclusiva para este sistema.
          </p>
        </div>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
