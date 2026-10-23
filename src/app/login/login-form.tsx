"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { StoneLoader } from "@/components/brand/stone-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DemoAccount } from "@/lib/demo"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { loginAction } from "@/server/actions/auth"

export function LoginForm({
  callbackUrl,
  demoAccounts = [],
}: {
  callbackUrl: string
  /** Só no modo demonstração: atalhos que preenchem e enviam o login. */
  demoAccounts?: DemoAccount[]
}) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  // Mantém a tela de carregamento visível durante o login e também no
  // redirecionamento seguinte, até esta tela sair de cena.
  const [entering, setEntering] = useState(false)

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
    setEntering(true)
    const result = await loginAction(values)

    if (!result.ok) {
      setFormError(result.error)
      setEntering(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  function enterAs(account: DemoAccount) {
    void onSubmit({ email: account.email, password: account.password })
  }

  return (
    <>
      {entering && (
        <div className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm duration-300">
          <StoneLoader label="Preparando seu ambiente de trabalho…" />
        </div>
      )}

      {demoAccounts.length > 0 && (
        <div className="space-y-2.5">
          {demoAccounts.map((account) => {
            const Icon = account.role === "admin" ? ShieldCheck : UserRound
            return (
              <button
                key={account.email}
                type="button"
                disabled={entering}
                onClick={() => enterAs(account)}
                className="group flex w-full items-center gap-3.5 rounded-lg border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-accent/50 hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">Entrar como {account.label.toLowerCase()}</span>
                  <span className="block text-xs text-muted-foreground">{account.description}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </button>
            )
          })}
          {formError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              {formError}
            </div>
          )}
        </div>
      )}

      {/* No modo demonstração as contas já estão nos botões acima; o formulário
          manual só aparece na instalação real. */}
      {demoAccounts.length === 0 && (
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
      )}
    </>
  )
}
