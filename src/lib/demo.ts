/**
 * Modo demonstração.
 *
 * Ligado com `DEMO_MODE=true`, o sistema passa a funcionar como vitrine
 * pública: a tela de login oferece as contas abaixo, um aviso fixo lembra que
 * os dados são fictícios e a rotina diária (ver `/api/cron/keep-alive`)
 * devolve o banco ao estado inicial. Nunca ligue isso na instalação real da
 * marmoraria: as senhas destas contas são públicas.
 */

export const DEMO_MODE = process.env.DEMO_MODE === "true"

export type DemoAccount = {
  role: "admin" | "collaborator"
  label: string
  description: string
  name: string
  email: string
  password: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "admin",
    label: "Administrador",
    description: "Acesso total: usuários, permissões e configurações.",
    name: "Helena Krause",
    email: "admin@example.com",
    password: "demo-admin",
  },
  {
    role: "collaborator",
    label: "Colaborador",
    description: "Só vê os projetos em que trabalha e não acessa usuários.",
    name: "Rafael Schmitt",
    email: "colaborador@example.com",
    password: "demo-colaborador",
  },
]

export const DEMO_RESET_NOTICE =
  "Ambiente de demonstração com dados fictícios. Tudo volta ao estado inicial uma vez por dia."

/** Verdadeiro quando o e-mail é de uma conta pública de demonstração (só no modo demonstração). */
export function isProtectedDemoEmail(email: string | null | undefined): boolean {
  if (!DEMO_MODE || !email) return false
  const normalized = email.trim().toLowerCase()
  return DEMO_ACCOUNTS.some((account) => account.email === normalized)
}
