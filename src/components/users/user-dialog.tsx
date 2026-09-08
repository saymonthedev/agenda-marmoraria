"use client"

import { Permission, UserRole } from "@prisma/client"
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserForm } from "@/components/users/user-form"

export function UserDialog({
  user,
  trigger,
}: {
  user?: {
    id: string
    name: string
    email: string
    role: UserRole
    permissions: Permission[]
  }
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize o perfil e as permissões deste usuário."
              : "Defina as credenciais e o nível de acesso do novo usuário."}
          </DialogDescription>
        </DialogHeader>
        <UserForm user={user} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
