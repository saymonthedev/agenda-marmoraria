import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const email = parsed.data.email.toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.active) return null

        const passwordMatches = await compare(parsed.data.password, user.passwordHash)
        if (!passwordMatches) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.permissions = user.permissions
        token.active = true
        return token
      }

      // Revalida o usuário a cada requisição para refletir imediatamente
      // desativações ou mudanças de permissão feitas pelo administrador.
      if (token.id) {
        const current = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { active: true, role: true, permissions: true },
        })

        // Usuário desativado ou excluído: invalida a sessão imediatamente.
        if (!current || !current.active) {
          return null
        }

        token.active = true
        token.role = current.role
        token.permissions = current.permissions
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.permissions = token.permissions
      }
      return session
    },
  },
})
