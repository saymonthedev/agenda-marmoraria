import "server-only"

import { Prisma } from "@prisma/client"

import { canViewAllProjects, projectVisibilityFilter, type SessionUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export async function listCustomers(user: SessionUser, search?: string) {
  const conditions: Prisma.CustomerWhereInput[] = []

  if (!canViewAllProjects(user)) {
    conditions.push({ projects: { some: projectVisibilityFilter(user) } })
  }

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    })
  }

  return prisma.customer.findMany({
    where: conditions.length ? { AND: conditions } : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { projects: true } },
    },
  })
}

export async function listCustomersForSelect() {
  return prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}

export async function getCustomerById(user: SessionUser, id: string) {
  const canSeeAll = canViewAllProjects(user)

  const customer = await prisma.customer.findFirst({
    where: canSeeAll ? { id } : { id, projects: { some: projectVisibilityFilter(user) } },
    include: {
      projects: {
        where: canSeeAll ? undefined : projectVisibilityFilter(user),
        orderBy: { createdAt: "desc" },
        include: {
          responsible: { select: { id: true, name: true } },
        },
      },
    },
  })

  return customer
}
