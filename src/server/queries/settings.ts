import "server-only"

import { prisma } from "@/lib/prisma"

const SETTINGS_ID = "singleton"

export async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } })

  if (settings) return settings

  return prisma.settings.create({ data: { id: SETTINGS_ID } })
}
