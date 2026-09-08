import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LogoMark } from "@/components/brand/logo-mark"
import { StonePattern } from "@/components/brand/stone-pattern"
import { getCurrentUser } from "@/lib/authorization"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Entrar",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const user = await getCurrentUser()
  if (user) redirect("/dashboard")

  const params = await searchParams
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/dashboard"

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar px-12 py-12 text-sidebar-foreground lg:flex">
        <StonePattern className="pointer-events-none absolute inset-0 h-full w-full" />

        <div className="relative z-10 flex items-center gap-3">
          <LogoMark className="size-9" />
          <span className="font-heading text-2xl font-medium tracking-wide">LITHOS</span>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <p className="font-heading text-3xl leading-snug text-balance">
            Da medição ao acabamento, cada projeto sob controle.
          </p>
          <p className="text-sm leading-relaxed text-sidebar-foreground/70">
            Sistema de gestão feito para o dia a dia de uma marmoraria: projetos, clientes,
            tarefas e agenda em um só lugar.
          </p>
        </div>

        <p className="relative z-10 text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} Lithos — Gestão para marmorarias
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 md:px-20 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="size-8 text-foreground" />
            <span className="font-heading text-xl font-medium tracking-wide">LITHOS</span>
          </div>

          <div className="mb-8 space-y-1.5">
            <h1 className="font-heading text-2xl font-medium">Entrar no sistema</h1>
            <p className="text-sm text-muted-foreground">
              Use as credenciais fornecidas pela administração da marmoraria.
            </p>
          </div>

          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  )
}
