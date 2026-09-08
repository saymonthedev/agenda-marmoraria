"use server"

import { AuthError } from "next-auth"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { signIn, signOut } from "@/lib/auth"
import { loginSchema } from "@/lib/validations/auth"

export async function loginAction(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.")
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
