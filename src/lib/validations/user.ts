import { Permission, UserRole } from "@prisma/client"
import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.nativeEnum(Permission)).default([]),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(2, "Informe o nome completo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.nativeEnum(Permission)).default([]),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
})

export const toggleUserActiveSchema = z.object({
  userId: z.string().min(1),
  active: z.boolean(),
})

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual"),
    newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "A confirmação não corresponde à nova senha",
    path: ["confirmPassword"],
  })
