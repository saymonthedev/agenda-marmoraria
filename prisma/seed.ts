import { randomBytes } from "node:crypto"

import { PrismaClient, UserRole } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

// O e-mail e a senha do primeiro administrador vêm do ambiente. Sem
// SEED_ADMIN_PASSWORD, uma senha aleatória é gerada e mostrada uma única vez
// no terminal: nenhuma instalação nasce com uma senha conhecida.
const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL ?? "admin@admin.com").trim().toLowerCase()
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || undefined

async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) {
    console.log(`Usuário administrador já existe: ${ADMIN_EMAIL} (senha não alterada).`)
    return existing
  }

  if (ADMIN_PASSWORD !== undefined && ADMIN_PASSWORD.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD precisa ter pelo menos 8 caracteres.")
  }
  const password = ADMIN_PASSWORD ?? randomBytes(12).toString("base64url")

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: ADMIN_EMAIL,
      passwordHash: await hash(password, 12),
      role: UserRole.ADMIN,
      permissions: [],
      active: true,
    },
  })

  console.log(`Usuário administrador pronto: ${admin.email}`)
  if (ADMIN_PASSWORD === undefined) {
    console.log(`Senha gerada (anote agora, ela não será mostrada de novo): ${password}`)
  }
  return admin
}

async function main() {
  await seedAdmin()
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
