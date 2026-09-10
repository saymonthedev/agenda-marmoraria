import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations/auth"
import { getClientIp, isLoginBlocked, recordLoginAttempt } from "@/server/login-attempts"

// Intervalo mínimo entre revalidações do usuário no banco de dados. Evita uma
// consulta ao banco em toda navegação/requisição (o que deixava o sistema
// perceptivelmente lento), mantendo ainda uma checagem periódica para que
// desativações de conta e mudanças de permissão sejam refletidas em poucos
// minutos, sem exigir logout manual.
const REVALIDATE_INTERVAL_MS = 5 * 60 * 1000

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
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const email = parsed.data.email.toLowerCase()
        const ip = getClientIp(request.headers)

        // A checagem fica aqui (e não só na Server Action da tela de login)
        // porque o endpoint de credenciais pode ser chamado diretamente.
        if (await isLoginBlocked(email, ip)) return null

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.active) {
          await recordLoginAttempt(email, ip, false)
          return null
        }

        const passwordMatches = await compare(parsed.data.password, user.passwordHash)

        if (!passwordMatches) {
          await recordLoginAttempt(email, ip, false)
          return null
        }

        await recordLoginAttempt(email, ip, true)

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
      const now = Date.now()

      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.permissions = user.permissions
        token.active = true
        token.validatedAt = now
        return token
      }

      const validatedAt = typeof token.validatedAt === "number" ? token.validatedAt : 0

      // Revalida o usuário periodicamente (não a cada requisição) para
      // refletir desativações ou mudanças de permissão sem pesar no tempo de
      // resposta de cada navegação.
      if (token.id && now - validatedAt > REVALIDATE_INTERVAL_MS) {
        const current = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { active: true, role: true, permissions: true },
        })

        // Usuário desativado ou excluído: invalida a sessão.
        if (!current || !current.active) {
          return null
        }

        token.active = true
        token.role = current.role
        token.permissions = current.permissions
        token.validatedAt = now
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
