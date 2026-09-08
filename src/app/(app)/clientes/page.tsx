import { Permission } from "@prisma/client"
import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Users } from "lucide-react"

import { CustomerDialog } from "@/components/customers/customer-dialog"
import { CustomerRowActions } from "@/components/customers/customer-row-actions"
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
import { listCustomers } from "@/server/queries/customers"

export const metadata: Metadata = { title: "Clientes" }

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const user = await requireUser()
  const { q } = await searchParams
  const customers = await listCustomers(user, q)
  const canManage = isAdmin(user) || hasPermission(user, Permission.CUSTOMERS_MANAGE)

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <PageHeader
        title="Clientes"
        description="Pessoas e empresas atendidas pela marmoraria."
        actions={
          canManage && (
            <CustomerDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Novo cliente
                </Button>
              }
            />
          )
        }
      />

      <SearchInput placeholder="Pesquisar por nome, e-mail ou telefone..." />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          description={
            q
              ? "Tente pesquisar por outro nome, e-mail ou telefone."
              : "Cadastre o primeiro cliente para começar a criar projetos."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Contato</TableHead>
                <TableHead className="hidden md:table-cell">Endereço</TableHead>
                <TableHead className="text-center">Projetos</TableHead>
                {canManage && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <Link href={`/clientes/${customer.id}`} className="hover:text-accent hover:underline">
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    <div className="flex flex-col text-xs">
                      {customer.phone && <span>{customer.phone}</span>}
                      {customer.email && <span>{customer.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-64 truncate text-muted-foreground md:table-cell">
                    {customer.address ?? "—"}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {customer._count.projects}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <CustomerRowActions customer={customer} canManage={canManage} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
