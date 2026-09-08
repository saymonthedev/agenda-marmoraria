"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings"
import { updateSettings } from "@/server/actions/settings"

type SettingsFormProps = {
  settings: {
    dueSoonDays: number
    companyName: string | null
    companyPhone: string | null
    companyEmail: string | null
    companyAddress: string | null
  }
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      dueSoonDays: settings.dueSoonDays,
      companyName: settings.companyName ?? "",
      companyPhone: settings.companyPhone ?? "",
      companyEmail: settings.companyEmail ?? "",
      companyAddress: settings.companyAddress ?? "",
    },
  })

  async function onSubmit(values: SettingsInput) {
    const result = await updateSettings(values)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success("Configurações salvas com sucesso.")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-8">
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="font-heading text-lg font-medium">Prazos</h2>
          <p className="text-sm text-muted-foreground">
            Define a partir de quantos dias antes do vencimento um projeto passa a aparecer como
            &quot;prazo próximo&quot; no dashboard e nas listagens.
          </p>
        </div>
        <div className="max-w-40 space-y-1.5">
          <Label htmlFor="dueSoonDays">Dias de antecedência</Label>
          <Input
            id="dueSoonDays"
            type="number"
            min={1}
            max={60}
            autoComplete="off"
            {...register("dueSoonDays", { valueAsNumber: true })}
          />
          {errors.dueSoonDays && (
            <p className="text-sm text-destructive">{errors.dueSoonDays.message}</p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="font-heading text-lg font-medium">Dados da marmoraria</h2>
          <p className="text-sm text-muted-foreground">
            Informações de contato da empresa, usadas como referência dentro do sistema.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input id="companyName" autoComplete="off" placeholder="Stainhaus Marmoraria" {...register("companyName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyPhone">Telefone</Label>
            <Input id="companyPhone" autoComplete="off" placeholder="(00) 00000-0000" {...register("companyPhone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyEmail">E-mail</Label>
            <Input id="companyEmail" type="email" autoComplete="off" placeholder="contato@empresa.com" {...register("companyEmail")} />
            {errors.companyEmail && (
              <p className="text-sm text-destructive">{errors.companyEmail.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyAddress">Endereço</Label>
            <Input id="companyAddress" autoComplete="off" placeholder="Rua, número, bairro, cidade" {...register("companyAddress")} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Salvar configurações
        </Button>
      </div>
    </form>
  )
}
