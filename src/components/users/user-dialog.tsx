"use client"

import { Permission, UserRole } from "@prisma/client"
import type { ReactElement } from "react"
import { useState } from "react"

import { TooltipWrap } from "@/components/shared/tooltip-wrap"
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
  tooltip,
}: {
  user?: {
    id: string
    name: string
    email: string
    role: UserRole
    permissions: Permission[]
  }
  trigger: ReactElement
  tooltip?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerElement = <DialogTrigger asChild>{trigger}</DialogTrigger>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltip ? <TooltipWrap label={tooltip}>{triggerElement}</TooltipWrap> : triggerElement}
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
