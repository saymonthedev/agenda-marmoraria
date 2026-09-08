"use server"

import { Permission } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { fail, ok, toActionError, type ActionResult } from "@/lib/action-result"
import { assertPermission, requireUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { emptyToUndefined } from "@/lib/utils"
import { customerSchema } from "@/lib/validations/customer"

function toCustomerData(data: ReturnType<typeof customerSchema.parse>) {
  return {
    name: data.name,
    phone: emptyToUndefined(data.phone),
    email: emptyToUndefined(data.email),
    address: emptyToUndefined(data.address),
    notes: emptyToUndefined(data.notes),
  }
}

export async function createCustomer(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.CUSTOMERS_MANAGE)

    const data = customerSchema.parse(input)
    const customer = await prisma.customer.create({ data: toCustomerData(data) })

    revalidatePath("/clientes")
    return ok({ id: customer.id })
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateCustomer(
  customerId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.CUSTOMERS_MANAGE)

    const data = customerSchema.parse(input)
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: toCustomerData(data),
    })

    revalidatePath("/clientes")
    revalidatePath(`/clientes/${customerId}`)
    return ok({ id: customer.id })
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteCustomer(customerId: string): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.CUSTOMERS_MANAGE)

    const projectCount = await prisma.project.count({ where: { customerId } })
    if (projectCount > 0) {
      return fail(
        "Este cliente possui projetos vinculados e não pode ser excluído. Remova ou transfira os projetos primeiro."
      )
    }

    await prisma.customer.delete({ where: { id: customerId } })

    revalidatePath("/clientes")
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}
