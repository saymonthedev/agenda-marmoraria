"use client"

import { Permission, UserRole } from "@prisma/client"
import { KeyRound, Pencil, Trash2, UserCheck, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TooltipWrap } from "@/components/shared/tooltip-wrap"
import { Button } from "@/components/ui/button"
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog"
import { UserDialog } from "@/components/users/user-dialog"
import { deleteUser, toggleUserActive } from "@/server/actions/users"

type UserRow = {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: Permission[]
  active: boolean
}

export function UserRowActions({ user, currentUserId }: { user: UserRow; currentUserId: string }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isSelf = user.id === currentUserId

  return (
    <div className="flex items-center justify-end gap-1">
      <UserDialog
        user={user}
        tooltip="Editar usuário"
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Editar usuário">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <ResetPasswordDialog
        userId={user.id}
        userName={user.name}
        tooltip="Redefinir senha"
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Redefinir senha">
            <KeyRound className="size-4" />
          </Button>
        }
      />
      {!isSelf && (
        <>
          <TooltipWrap label={user.active ? "Desativar usuário" : "Reativar usuário"}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={user.active ? "Desativar usuário" : "Reativar usuário"}
              onClick={() => setConfirmOpen(true)}
            >
              {user.active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
            </Button>
          </TooltipWrap>
          <TooltipWrap label="Excluir usuário">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Excluir usuário"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipWrap>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={user.active ? "Desativar usuário" : "Reativar usuário"}
        description={
          user.active
            ? `"${user.name}" não poderá mais acessar o sistema até ser reativado.`
            : `"${user.name}" voltará a ter acesso ao sistema.`
        }
        confirmLabel={user.active ? "Desativar" : "Reativar"}
        destructive={user.active}
        onConfirm={async () => {
          const result = await toggleUserActive({ userId: user.id, active: !user.active })
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success(user.active ? "Usuário desativado." : "Usuário reativado.")
          router.refresh()
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir usuário definitivamente"
        description={`Tem certeza que deseja excluir "${user.name}"? Essa ação não pode ser desfeita. Projetos e tarefas em que ${user.name} era responsável continuam existindo, apenas sem responsável definido.`}
        confirmLabel="Excluir definitivamente"
        destructive
        onConfirm={async () => {
          const result = await deleteUser(user.id)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Usuário excluído.")
          router.refresh()
        }}
      />
    </div>
  )
}
