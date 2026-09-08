import "server-only"

import { prisma } from "@/lib/prisma"

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
      _count: {
        select: { responsibleProjects: true, responsibleTasks: true },
      },
    },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
      createdBy: { select: { name: true } },
    },
  })
}

export async function countActiveAdmins() {
  return prisma.user.count({ where: { role: "ADMIN", active: true } })
}
