import "server-only"

import { Permission } from "@prisma/client"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { AuthorizationError, hasPermission, isAdmin, type SessionUser } from "@/lib/access"

export type { SessionUser } from "@/lib/access"
export {
  AuthorizationError,
  canViewAllProjects,
  calendarVisibilityFilter,
  hasAnyPermission,
  hasPermission,
  isAdmin,
  projectVisibilityFilter,
} from "@/lib/access"

/** Retorna o usuário autenticado ou `null`, sem redirecionar. Uso em pontos onde a ausência de sessão é uma condição normal. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null
  return session.user as SessionUser
}

/** Garante que existe um usuário autenticado. Redireciona para o login em Server Components/Pages. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

/** Uso em Server Actions e route handlers: lança erro (nunca confia só na UI escondida). */
export function assertPermission(user: SessionUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new AuthorizationError()
  }
}

export function assertAdmin(user: SessionUser): void {
  if (!isAdmin(user)) {
    throw new AuthorizationError("Apenas administradores podem realizar esta ação.")
  }
}
