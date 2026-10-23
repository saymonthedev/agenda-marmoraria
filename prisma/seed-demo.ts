// Popula o banco com o cenário fictício do modo demonstração.
// ATENÇÃO: apaga todos os dados antes. Use só no banco da demonstração.
import fs from "node:fs"

import { PrismaClient } from "@prisma/client"

import { DEMO_ACCOUNTS } from "../src/lib/demo"
import { resetDemoData } from "../src/server/demo/demo-data"

if (fs.existsSync(".env")) process.loadEnvFile(".env")
// Mesmo fuso do servidor (ver src/instrumentation.ts): "hoje" é o dia em Brasília.
process.env.TZ = "America/Sao_Paulo"

const prisma = new PrismaClient()

async function main() {
  if (process.env.DEMO_MODE !== "true") {
    throw new Error(
      "Este script apaga todos os dados. Rode só no banco da demonstração, com DEMO_MODE=true."
    )
  }

  await resetDemoData(prisma)

  console.log("Cenário de demonstração pronto. Contas:")
  for (const account of DEMO_ACCOUNTS) {
    console.log(`  ${account.label}: ${account.email} / ${account.password}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
