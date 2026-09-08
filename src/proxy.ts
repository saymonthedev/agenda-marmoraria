import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const PUBLIC_PATHS = ["/login"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  const isLoggedIn = !!req.auth?.user

  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  // Além das pastas internas do Next, exclui qualquer arquivo estático da
  // pasta /public (imagens, ícones etc.) — sem isso, o otimizador de imagens
  // do Next faz uma requisição interna para o arquivo que também passa pelo
  // proxy, é redirecionada para /login e quebra a imagem.
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif)$).*)",
  ],
}
