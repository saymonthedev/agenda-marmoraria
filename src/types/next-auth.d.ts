import { Permission, UserRole } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role: UserRole
    permissions: Permission[]
  }

  interface Session {
    user: {
      id: string
      role: UserRole
      permissions: Permission[]
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    permissions: Permission[]
    active: boolean
    validatedAt: number
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: UserRole
    permissions: Permission[]
    active: boolean
    validatedAt: number
  }
}
