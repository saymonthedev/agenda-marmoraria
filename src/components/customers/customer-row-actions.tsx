"use client"

import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { CustomerDialog } from "@/components/customers/customer-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TooltipWrap } from "@/components/shared/tooltip-wrap"
import { Button } from "@/components/ui/button"
import { deleteCustomer } from "@/server/actions/customers"

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
}

export function CustomerRowActions({ customer, canManage }: { customer: Customer; canManage: boolean }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!canManage) return null

  return (
    <div className="flex items-center justify-end gap-1">
      <CustomerDialog
        customer={customer}
        tooltip="Editar cliente"
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Editar cliente">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <TooltipWrap label="Excluir cliente">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Excluir cliente"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </TooltipWrap>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir "${customer.name}"? Essa ação não poderá ser desfeita. Clientes com projetos vinculados não podem ser excluídos.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          const result = await deleteCustomer(customer.id)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Cliente excluído com sucesso.")
          router.refresh()
        }}
      />
    </div>
  )
}
