import { z } from "zod"

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente"),
  phone: z.string().trim().optional(),
  email: z
    .union([z.literal(""), z.string().trim().toLowerCase().email("E-mail inválido")])
    .optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export type CustomerInput = z.infer<typeof customerSchema>
