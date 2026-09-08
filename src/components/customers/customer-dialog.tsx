"use client"

import { useState } from "react"

import { CustomerForm } from "@/components/customers/customer-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type CustomerDialogProps = {
  trigger: React.ReactNode
  customer?: {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    notes: string | null
  }
}

export function CustomerDialog({ trigger, customer }: CustomerDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
