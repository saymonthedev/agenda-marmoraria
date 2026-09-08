import "server-only"

import { Prisma } from "@prisma/client"

import { calendarVisibilityFilter, type SessionUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export async function listCalendarEvents(user: SessionUser, range: { from: Date; to: Date }) {
  const where: Prisma.CalendarEventWhereInput = {
    AND: [calendarVisibilityFilter(user), { startAt: { gte: range.from, lte: range.to } }],
  }

  return prisma.calendarEvent.findMany({
    where,
    orderBy: { startAt: "asc" },
    include: {
      project: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })
}

export async function listUpcomingEvents(user: SessionUser, limit = 5) {
  return prisma.calendarEvent.findMany({
    where: {
      AND: [calendarVisibilityFilter(user), { startAt: { gte: new Date() } }],
    },
    orderBy: { startAt: "asc" },
    take: limit,
    include: {
      project: { select: { id: true, name: true } },
    },
  })
}
