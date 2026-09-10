"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { loginAction } from "@/server/actions/auth"

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    setFormError(null)
    const result = await loginAction(values)

    if (!result.ok) {
      setFormError(result.error)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="off"
          placeholder="seu.email@empresa.com"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="off"
            placeholder="••••••••"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="group relative h-11 w-full justify-center gap-2.5 rounded-lg bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--primary),white_14%),var(--primary))] text-[0.8rem] font-medium tracking-[0.14em] text-primary-foreground uppercase shadow-sm ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-[0_10px_28px_-12px_var(--accent)] hover:brightness-110 disabled:opacity-80"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Entrando
          </>
        ) : (
          <>
            Entrar
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  )
}
