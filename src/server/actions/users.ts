"use server"

import { UserRole } from "@prisma/client"
import { compare, hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

import { fail, KnownActionError, ok, toActionError, type ActionResult } from "@/lib/action-result"
import { assertAdmin, requireUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import {
  changeOwnPasswordSchema,
  createUserSchema,
  resetPasswordSchema,
  toggleUserActiveSchema,
  updateUserSchema,
} from "@/lib/validations/user"
import { countActiveAdmins } from "@/server/queries/users"

export async function createUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const currentUser = await requireUser()
    assertAdmin(currentUser)

    const data = createUserSchema.parse(input)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return fail("Já existe um usuário cadastrado com este e-mail.")

    const passwordHash = await hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        permissions: data.role === UserRole.ADMIN ? [] : data.permissions,
        createdById: currentUser.id,
      },
    })

    revalidatePath("/usuarios")
    return ok({ id: user.id })
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const currentUser = await requireUser()
    assertAdmin(currentUser)

    const data = updateUserSchema.parse(input)

    const target = await prisma.user.findUnique({ where: { id: data.userId } })
    if (!target) return fail("Usuário não encontrado.")

    const emailInUse = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: data.userId } },
    })
    if (emailInUse) return fail("Já existe um usuário cadastrado com este e-mail.")

    if (target.role === UserRole.ADMIN && data.role === UserRole.COLLABORATOR) {
      const activeAdmins = await countActiveAdmins()
      if (activeAdmins <= 1) {
        throw new KnownActionError(
          "Não é possível rebaixar o último administrador ativo do sistema."
        )
      }
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        permissions: data.role === UserRole.ADMIN ? [] : data.permissions,
      },
    })

    revalidatePath("/usuarios")
    return ok({ id: data.userId })
  } catch (error) {
    return toActionError(error)
  }
}

export async function resetUserPassword(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const currentUser = await requireUser()
    assertAdmin(currentUser)

    const data = resetPasswordSchema.parse(input)
    const passwordHash = await hash(data.password, 12)

    await prisma.user.update({
      where: { id: data.userId },
      data: { passwordHash },
    })

    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function toggleUserActive(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const currentUser = await requireUser()
    assertAdmin(currentUser)

    const data = toggleUserActiveSchema.parse(input)

    if (data.userId === currentUser.id && !data.active) {
      throw new KnownActionError("Você não pode desativar sua própria conta.")
    }

    const target = await prisma.user.findUnique({ where: { id: data.userId } })
    if (!target) return fail("Usuário não encontrado.")

    if (target.role === UserRole.ADMIN && !data.active) {
      const activeAdmins = await countActiveAdmins()
      if (activeAdmins <= 1) {
        throw new KnownActionError("Não é possível desativar o último administrador ativo.")
      }
    }

    await prisma.user.update({ where: { id: data.userId }, data: { active: data.active } })

    revalidatePath("/usuarios")
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteUser(userId: string): Promise<ActionResult<undefined>> {
  try {
    const currentUser = await requireUser()
    assertAdmin(currentUser)

    if (userId === currentUser.id) {
      throw new KnownActionError("Você não pode excluir sua própria conta.")
    }

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return fail("Usuário não encontrado.")

    if (target.role === UserRole.ADMIN && target.active) {
      const activeAdmins = await countActiveAdmins()
      if (activeAdmins <= 1) {
        throw new KnownActionError("Não é possível excluir o último administrador ativo.")
      }
    }

    await prisma.user.delete({ where: { id: userId } })

    revalidatePath("/usuarios")
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function changeOwnPassword(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const currentUser = await requireUser()
    const data = changeOwnPasswordSchema.parse(input)

    const user = await prisma.user.findUniqueOrThrow({ where: { id: currentUser.id } })
    const matches = await compare(data.currentPassword, user.passwordHash)
    if (!matches) return fail("Senha atual incorreta.")

    const passwordHash = await hash(data.newPassword, 12)
    await prisma.user.update({ where: { id: currentUser.id }, data: { passwordHash } })

    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}
