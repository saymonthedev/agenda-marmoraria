"use client"

import type { ReactElement } from "react"
import { useState } from "react"

import { CustomerForm } from "@/components/customers/customer-form"
import { TooltipWrap } from "@/components/shared/tooltip-wrap"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type CustomerDialogProps = {
  trigger: ReactElement
  tooltip?: string
  customer?: {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    notes: string | null
  }
}

export function CustomerDialog({ trigger, tooltip, customer }: CustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const triggerElement = <DialogTrigger asChild>{trigger}</DialogTrigger>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltip ? <TooltipWrap label={tooltip}>{triggerElement}</TooltipWrap> : triggerElement}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            {customer
              ? "Atualize as informações de contato e observações deste cliente."
              : "Cadastre um novo cliente para vincular a projetos da marmoraria."}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm customer={customer} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
