import { NextResponse } from "next/server"

import { DEMO_MODE } from "@/lib/demo"
import { prisma } from "@/lib/prisma"
import { resetDemoData } from "@/server/demo/demo-data"
import { purgeOldLoginAttempts } from "@/server/login-attempts"

export const dynamic = "force-dynamic"

/**
 * Rotina diária de manutenção, chamada pelo Vercel Cron (ver vercel.json):
 * mantém o banco ativo em provedores serverless que suspendem o compute por
 * inatividade e limpa o registro antigo de tentativas de login. No modo
 * demonstração, também devolve os dados ao cenário inicial.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  // Falha fechada: sem segredo configurado, o endpoint fica indisponível
  // em vez de aberto para qualquer pessoa.
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 })
  }

  const startedAt = Date.now()
  await prisma.$queryRaw`SELECT 1`
  const purgedLoginAttempts = await purgeOldLoginAttempts()
  if (DEMO_MODE) await resetDemoData(prisma)

  return NextResponse.json({
    ok: true,
    demoReset: DEMO_MODE,
    latencyMs: Date.now() - startedAt,
    purgedLoginAttempts,
    checkedAt: new Date().toISOString(),
  })
}
