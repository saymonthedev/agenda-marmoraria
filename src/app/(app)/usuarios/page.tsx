import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Plus, UserCog } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserDialog } from "@/components/users/user-dialog"
import { UserRowActions } from "@/components/users/user-row-actions"
import { isAdmin, requireUser } from "@/lib/authorization"
import { formatDate } from "@/lib/dates"
import { USER_ROLE_LABELS } from "@/lib/labels"
import { listUsers } from "@/server/queries/users"

export const metadata: Metadata = { title: "Usuários" }

export default async function UsersPage() {
  const currentUser = await requireUser()
  if (!isAdmin(currentUser)) redirect("/dashboard")

  const users = await listUsers()

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <PageHeader
        title="Usuários"
        description="Controle quem tem acesso ao sistema e o que cada pessoa pode fazer."
        actions={
          <UserDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Novo usuário
              </Button>
            }
          />
        }
      />

      {users.length === 0 ? (
        <EmptyState icon={UserCog} title="Nenhum usuário cadastrado" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="hidden md:table-cell">Desde</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {USER_ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <span className="text-xs font-medium text-success">Ativo</span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">Desativado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <UserRowActions user={user} currentUserId={currentUser.id} />
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
