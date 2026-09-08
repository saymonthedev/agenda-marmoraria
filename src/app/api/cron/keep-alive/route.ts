import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Endpoint chamado periodicamente pelo Vercel Cron (ver vercel.json) para
 * manter o banco de dados ativo em provedores serverless que suspendem o
 * compute após um período de inatividade (Neon, Vercel Postgres etc.),
 * evitando o atraso de "cold start" na primeira requisição dos usuários.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 })
  }

  const startedAt = Date.now()
  await prisma.$queryRaw`SELECT 1`

  return NextResponse.json({
    ok: true,
    latencyMs: Date.now() - startedAt,
    checkedAt: new Date().toISOString(),
  })
}
