"use server"

import { AuthError } from "next-auth"

import { headers } from "next/headers"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { signIn, signOut } from "@/lib/auth"
import { loginSchema } from "@/lib/validations/auth"
import { getClientIp, isLoginBlocked, LOGIN_BLOCK_MESSAGE } from "@/server/login-attempts"

export async function loginAction(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.")
  }

  // O bloqueio real acontece no Auth.js; aqui apenas devolvemos uma mensagem
  // clara em vez do genérico "e-mail ou senha inválidos".
  const requestHeaders = await headers()
  const email = parsed.data.email.toLowerCase()
  if (await isLoginBlocked(email, getClientIp(requestHeaders))) {
    return fail(LOGIN_BLOCK_MESSAGE)
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return ok(undefined)
  } catch (error) {
    if (error instanceof AuthError) {
      return fail("E-mail ou senha inválidos.")
    }
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
