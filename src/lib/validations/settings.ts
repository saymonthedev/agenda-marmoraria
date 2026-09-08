import { z } from "zod"

export const settingsSchema = z.object({
  dueSoonDays: z
    .number({ message: "Informe um número de dias" })
    .int()
    .min(1, "Informe pelo menos 1 dia")
    .max(60, "Máximo de 60 dias"),
  companyName: z.string().trim().optional(),
  companyPhone: z.string().trim().optional(),
  companyEmail: z
    .union([z.literal(""), z.string().trim().toLowerCase().email("E-mail inválido")])
    .optional(),
  companyAddress: z.string().trim().optional(),
})

export type SettingsInput = z.infer<typeof settingsSchema>
