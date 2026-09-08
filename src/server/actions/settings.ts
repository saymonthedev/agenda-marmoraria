"use server"

import { Permission } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { ok, toActionError, type ActionResult } from "@/lib/action-result"
import { assertPermission, requireUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { emptyToUndefined } from "@/lib/utils"
import { settingsSchema } from "@/lib/validations/settings"

const SETTINGS_ID = "singleton"

export async function updateSettings(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.SETTINGS_MANAGE)

    const data = settingsSchema.parse(input)

    await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        dueSoonDays: data.dueSoonDays,
        companyName: emptyToUndefined(data.companyName),
        companyPhone: emptyToUndefined(data.companyPhone),
        companyEmail: emptyToUndefined(data.companyEmail),
        companyAddress: emptyToUndefined(data.companyAddress),
      },
      update: {
        dueSoonDays: data.dueSoonDays,
        companyName: emptyToUndefined(data.companyName) ?? null,
        companyPhone: emptyToUndefined(data.companyPhone) ?? null,
        companyEmail: emptyToUndefined(data.companyEmail) ?? null,
        companyAddress: emptyToUndefined(data.companyAddress) ?? null,
      },
    })

    revalidatePath("/configuracoes")
    revalidatePath("/dashboard")
    revalidatePath("/projetos")
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}
