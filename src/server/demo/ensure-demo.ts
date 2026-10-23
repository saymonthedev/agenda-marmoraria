import "server-only"

import { DEMO_ACCOUNTS, DEMO_MODE } from "@/lib/demo"
import { prisma } from "@/lib/prisma"
import { resetDemoData } from "@/server/demo/demo-data"

/**
 * No modo demonstração, monta o cenário fictício quando as contas de
 * demonstração ainda não existem (primeiro acesso depois de ligar o modo, ou
 * banco recém-criado). Chamado pela tela de login, que é a porta de entrada.
 * Fora do modo demonstração, não faz nada.
 */
export async function ensureDemoData() {
  if (!DEMO_MODE) return

  const admin = await prisma.user.findUnique({
    where: { email: DEMO_ACCOUNTS[0].email },
    select: { id: true },
  })
  if (!admin) await resetDemoData(prisma)
}
