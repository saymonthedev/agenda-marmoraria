export function register() {
  // A Vercel roda as funções em UTC por padrão e não permite definir a
  // variável de ambiente TZ (é reservada). Como o sistema é para uso no
  // Brasil, fixamos o fuso horário do processo aqui, no início do servidor,
  // para que toda formatação de data/hora e cálculos de prazo ("hoje",
  // "atrasado" etc.) considerem o horário de Brasília.
  process.env.TZ = "America/Sao_Paulo"
}
