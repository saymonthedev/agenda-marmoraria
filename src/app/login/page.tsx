import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Logo } from "@/components/brand/logo"
import { StonePattern } from "@/components/brand/stone-pattern"
import { getCurrentUser } from "@/lib/authorization"
import { DEMO_ACCOUNTS, DEMO_MODE, DEMO_RESET_NOTICE } from "@/lib/demo"
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

        <div className="relative z-10">
          <Logo className="px-3.5 py-2.5" />
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
          © {new Date().getFullYear()} Stainhaus Marmoraria
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 md:px-20 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="mb-8 space-y-1.5">
            <h1 className="font-heading text-2xl font-medium">
              {DEMO_MODE ? "Conheça o sistema" : "Entrar no sistema"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {DEMO_MODE
                ? `${DEMO_RESET_NOTICE} Escolha um perfil para entrar.`
                : "Use as credenciais fornecidas pela administração da marmoraria."}
            </p>
          </div>

          <LoginForm callbackUrl={callbackUrl} demoAccounts={DEMO_MODE ? DEMO_ACCOUNTS : []} />
        </div>
      </div>
    </div>
  )
}
