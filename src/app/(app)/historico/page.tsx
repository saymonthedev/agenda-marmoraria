import { Permission } from "@prisma/client"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { History } from "lucide-react"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { formatDateTime } from "@/lib/dates"
import { HISTORY_ACTION_LABELS } from "@/lib/labels"
import { listHistory } from "@/server/queries/history"

export const metadata: Metadata = { title: "Histórico" }

export default async function HistoryPage() {
  const user = await requireUser()
  if (!isAdmin(user) && !hasPermission(user, Permission.HISTORY_VIEW)) {
    redirect("/dashboard")
  }

  const entries = await listHistory(user)

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <PageHeader
        title="Histórico"
        description="Todas as ações registradas nos projetos que você tem acesso."
      />

      {entries.length === 0 ? (
        <EmptyState icon={History} title="Nenhuma atividade registrada ainda" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {HISTORY_ACTION_LABELS[entry.action]}
                    </Badge>
                    {!entry.project.active && (
                      <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                        Projeto desativado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground">
                    <Link href={`/projetos/${entry.project.id}`} className="font-medium hover:underline">
                      {entry.project.name}
                    </Link>{" "}
                    — {entry.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.user ? `${entry.user.name} · ` : ""}
                    {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
