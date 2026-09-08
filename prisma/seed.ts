import { PrismaClient, UserRole } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const ADMIN_EMAIL = "admin@admin.com"
const ADMIN_PASSWORD = "root"

async function seedAdmin() {
  const passwordHash = await hash(ADMIN_PASSWORD, 12)

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: "Administrador",
      email: ADMIN_EMAIL,
      passwordHash,
      role: UserRole.ADMIN,
      permissions: [],
      active: true,
    },
  })

  console.log(`Usuário administrador pronto: ${admin.email}`)
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
