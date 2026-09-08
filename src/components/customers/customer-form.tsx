"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { customerSchema, type CustomerInput } from "@/lib/validations/customer"
import { createCustomer, updateCustomer } from "@/server/actions/customers"

type CustomerFormProps = {
  customer?: {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    notes: string | null
  }
  onSuccess?: () => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
      notes: customer?.notes ?? "",
    },
  })

  async function onSubmit(values: CustomerInput) {
    const result = customer
      ? await updateCustomer(customer.id, values)
      : await createCustomer(values)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(customer ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.")
    router.refresh()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" autoComplete="off" placeholder="Nome do cliente" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" autoComplete="off" placeholder="(00) 00000-0000" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="off" placeholder="cliente@email.com" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Endereço</Label>
        <Input id="address" autoComplete="off" placeholder="Rua, número, bairro, cidade" {...register("address")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" rows={3} placeholder="Preferências de contato, detalhes relevantes..." {...register("notes")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {customer ? "Salvar alterações" : "Cadastrar cliente"}
        </Button>
      </div>
    </form>
  )
}
