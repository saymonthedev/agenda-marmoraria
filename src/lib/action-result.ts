import { ZodError } from "zod"
import { AuthorizationError } from "@/lib/access"

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error }
}

/** Converte erros conhecidos em mensagens amigáveis; loga o restante sem expor detalhes internos ao cliente. */
export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof AuthorizationError) {
    return fail(error.message)
  }

  if (error instanceof ZodError) {
    return fail(error.issues[0]?.message ?? "Dados inválidos.")
  }

  if (error instanceof Error && error.name === "KnownActionError") {
    return fail(error.message)
  }

  console.error(error)
  return fail("Ocorreu um erro inesperado. Tente novamente em instantes.")
}

/** Erro seguro para ser exibido ao usuário final, lançado deliberadamente dentro de uma Server Action. */
export class KnownActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "KnownActionError"
  }
}
