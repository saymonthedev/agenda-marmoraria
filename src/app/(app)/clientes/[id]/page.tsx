import { Permission } from "@prisma/client"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FolderKanban, Mail, MapPin, Phone } from "lucide-react"

import { CustomerRowActions } from "@/components/customers/customer-row-actions"
import { PriorityBadge, StageBadge } from "@/components/shared/badges"
import { EmptyState } from "@/components/shared/empty-state"
import { hasPermission, isAdmin, requireUser } from "@/lib/authorization"
import { formatDate } from "@/lib/dates"
import { getCustomerById } from "@/server/queries/customers"

export const metadata: Metadata = { title: "Detalhes do cliente" }

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const customer = await getCustomerById(user, id)

  if (!customer) notFound()

  const canManage = isAdmin(user) || hasPermission(user, Permission.CUSTOMERS_MANAGE)

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para clientes
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            Cliente desde {formatDate(customer.createdAt)}
          </p>
        </div>
        <CustomerRowActions customer={customer} canManage={canManage} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-medium">Contato</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <span>{customer.phone ?? "Telefone não informado"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span>{customer.email ?? "E-mail não informado"}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0 mt-0.5" />
              <span>{customer.address ?? "Endereço não informado"}</span>
            </div>
          </dl>
          {customer.notes && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Observações
              </p>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </section>

        <section className="lg:col-span-2 space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-medium">
            Projetos ({customer.projects.length})
          </h2>

          {customer.projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="Nenhum projeto para este cliente"
              description="Crie um projeto vinculado a este cliente a partir da tela de projetos."
            />
          ) : (
            <ul className="divide-y divide-border">
              {customer.projects.map((project) => (
                <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/projetos/${project.id}`}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.responsible ? `Responsável: ${project.responsible.name}` : "Sem responsável definido"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StageBadge stage={project.stage} />
                      <PriorityBadge priority={project.priority} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
