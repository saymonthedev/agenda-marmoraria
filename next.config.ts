import type { NextConfig } from "next"

/**
 * Cabeçalhos de segurança aplicados a todas as respostas.
 * O sistema é interno e não precisa ser embutido em outros sites, então
 * bloqueamos iframes por completo e restringimos o uso de APIs sensíveis.
 */
const securityHeaders = [
  // Impede que o sistema seja carregado dentro de um iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Impede o navegador de "adivinhar" o tipo de um arquivo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Não vaza a URL interna do sistema ao navegar para fora.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // O sistema não usa câmera, microfone nem geolocalização.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Força HTTPS em visitas futuras.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
