import { Permission, Prisma, UserRole } from "@prisma/client"

/**
 * Regras puras de autorização, sem nenhuma dependência de servidor
 * (banco de dados, sessão, cookies). Podem ser importadas tanto por
 * Server Components/Actions quanto por Client Components — por exemplo,
 * para decidir quais itens de menu exibir na barra lateral.
 *
 * A validação que realmente importa para a segurança acontece sempre no
 * servidor (ver `@/lib/authorization`); este arquivo só evita duplicar as
 * mesmas regras na camada visual.
 */

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  role: UserRole
  permissions: Permission[]
}

export class AuthorizationError extends Error {
  constructor(message = "Você não tem permissão para realizar esta ação.") {
    super(message)
    this.name = "AuthorizationError"
  }
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === UserRole.ADMIN
}

export function hasPermission(user: SessionUser, permission: Permission): boolean {
  if (isAdmin(user)) return true
  return user.permissions.includes(permission)
}

export function hasAnyPermission(user: SessionUser, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission))
}

export function canViewAllProjects(user: SessionUser): boolean {
  return isAdmin(user) || hasPermission(user, Permission.PROJECTS_VIEW_ALL)
}

/**
 * Fragmento de filtro Prisma que restringe a listagem de projetos ao que o
 * usuário pode efetivamente ver. Administradores e colaboradores com a
 * permissão PROJECTS_VIEW_ALL enxergam tudo; os demais colaboradores só veem
 * projetos em que são responsáveis ou membros adicionados.
 */
export function projectVisibilityFilter(user: SessionUser): Prisma.ProjectWhereInput {
  if (canViewAllProjects(user)) return {}

  return {
    OR: [{ responsibleId: user.id }, { members: { some: { userId: user.id } } }],
  }
}

/**
 * Eventos gerais (sem projeto vinculado) ficam visíveis a todos os usuários
 * autenticados. Eventos ligados a um projeto seguem a mesma visibilidade do
 * projeto em si.
 */
export function calendarVisibilityFilter(user: SessionUser): Prisma.CalendarEventWhereInput {
  if (canViewAllProjects(user)) return {}

  return {
    OR: [
      { projectId: null },
      {
        project: {
          is: { OR: [{ responsibleId: user.id }, { members: { some: { userId: user.id } } }] },
        },
      },
    ],
  }
}
