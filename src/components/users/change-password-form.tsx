"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changeOwnPasswordSchema } from "@/lib/validations/user"
import { changeOwnPassword } from "@/server/actions/users"

type FormValues = z.infer<typeof changeOwnPasswordSchema>

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(changeOwnPasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  async function onSubmit(values: FormValues) {
    const result = await changeOwnPassword(values)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success("Senha alterada com sucesso.")
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input id="currentPassword" type="password" autoComplete="off" {...register("currentPassword")} />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">Nova senha</Label>
          <Input id="newPassword" type="password" autoComplete="off" {...register("newPassword")} />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <Input id="confirmPassword" type="password" autoComplete="off" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Alterar senha
        </Button>
      </div>
    </form>
  )
}
