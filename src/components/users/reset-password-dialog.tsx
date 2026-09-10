"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import type { ReactElement } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { TooltipWrap } from "@/components/shared/tooltip-wrap"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetUserPassword } from "@/server/actions/users"

const schema = z.object({
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
})

export function ResetPasswordDialog({
  userId,
  userName,
  trigger,
  tooltip,
}: {
  userId: string
  userName: string
  trigger: ReactElement
  tooltip?: string
}) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    const result = await resetUserPassword({ userId, password: values.password })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`Senha de ${userName} redefinida com sucesso.`)
    reset()
    setOpen(false)
  }

  const triggerElement = <DialogTrigger asChild>{trigger}</DialogTrigger>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltip ? <TooltipWrap label={tooltip}>{triggerElement}</TooltipWrap> : triggerElement}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            Defina uma nova senha provisória para {userName}. Compartilhe com o usuário por um
            canal seguro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" type="password" autoComplete="off" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Redefinir senha
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
