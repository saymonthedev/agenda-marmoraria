import "server-only"

import { prisma } from "@/lib/prisma"

/**
 * Proteção contra força bruta no login.
 *
 * As tentativas ficam registradas no banco (e não em memória) porque a
 * aplicação roda em funções serverless: cada requisição pode cair em uma
 * instância diferente, e um contador em memória não bloquearia nada.
 */

const WINDOW_MINUTES = 15
/** Tentativas erradas para o mesmo e-mail antes de bloquear temporariamente. */
const MAX_FAILURES_PER_EMAIL = 5
/** Tentativas erradas vindas do mesmo IP (protege contra ataque distribuído entre e-mails). */
const MAX_FAILURES_PER_IP = 20

export const LOGIN_BLOCK_MESSAGE =
  "Muitas tentativas de login sem sucesso. Aguarde alguns minutos e tente novamente."

function windowStart() {
  return new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
}

/** Extrai o IP do cliente a partir dos cabeçalhos da requisição. */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null
  return headers.get("x-real-ip")
}

export async function isLoginBlocked(email: string, ip: string | null): Promise<boolean> {
  const since = windowStart()

  const [emailFailures, ipFailures] = await Promise.all([
    prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: since } },
    }),
    ip
      ? prisma.loginAttempt.count({
          where: { ip, success: false, createdAt: { gte: since } },
        })
      : Promise.resolve(0),
  ])

  return emailFailures >= MAX_FAILURES_PER_EMAIL || ipFailures >= MAX_FAILURES_PER_IP
}

export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  success: boolean
): Promise<void> {
  await prisma.loginAttempt.create({ data: { email, ip, success } })

  // Um login bem-sucedido zera o bloqueio daquele e-mail.
  if (success) {
    await prisma.loginAttempt.deleteMany({ where: { email, success: false } })
  }
}

/** Remove registros antigos — chamado pela rotina diária de manutenção. */
export async function purgeOldLoginAttempts(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const { count } = await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  return count
}
