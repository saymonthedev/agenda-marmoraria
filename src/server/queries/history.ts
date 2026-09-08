import "server-only"

import { projectVisibilityFilter, type SessionUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export async function listHistory(user: SessionUser, take = 100) {
  return prisma.projectHistory.findMany({
    where: { project: projectVisibilityFilter(user) },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { id: true, name: true } },
      project: { select: { id: true, name: true, active: true } },
    },
  })
}
