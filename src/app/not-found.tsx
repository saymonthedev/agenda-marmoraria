import Link from "next/link"

import { Logo } from "@/components/brand/logo"

export default function RootNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Logo />
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-medium text-foreground">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
      </div>
      <Link href="/dashboard" className="text-sm text-accent hover:underline">
        Voltar ao início
      </Link>
    </div>
  )
}
