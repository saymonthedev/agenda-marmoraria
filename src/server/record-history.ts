import "server-only"

import { HistoryAction, Prisma } from "@prisma/client"

type Db = Prisma.TransactionClient

export async function recordHistory(
  db: Db,
  params: {
    projectId: string
    userId: string | null | undefined
    action: HistoryAction
    description: string
  }
) {
  await db.projectHistory.create({
    data: {
      projectId: params.projectId,
      userId: params.userId ?? null,
      action: params.action,
      description: params.description,
    },
  })
}
