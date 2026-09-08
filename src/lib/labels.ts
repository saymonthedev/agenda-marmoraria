import {
  EventType,
  HistoryAction,
  Priority,
  ProjectStage,
  ProjectType,
  TaskStatus,
  UserRole,
} from "@prisma/client"

export const PROJECT_STAGE_ORDER: ProjectStage[] = [
  ProjectStage.ORCAMENTO,
  ProjectStage.APROVADO,
  ProjectStage.MEDICAO,
  ProjectStage.CORTE,
  ProjectStage.ACABAMENTO,
  ProjectStage.INSTALACAO,
  ProjectStage.CONCLUIDO,
]

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  ORCAMENTO: "Orçamento",
  APROVADO: "Aprovado",
  MEDICAO: "Medição",
  CORTE: "Corte",
  ACABAMENTO: "Acabamento",
  INSTALACAO: "Instalação",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
}

// Classes utilitárias (Tailwind) para identificar a etapa visualmente sem depender só do texto.
export const PROJECT_STAGE_STYLES: Record<ProjectStage, string> = {
  ORCAMENTO: "bg-muted text-muted-foreground border-border",
  APROVADO: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  MEDICAO: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  CORTE: "bg-warning/15 text-warning border-warning/30",
  ACABAMENTO: "bg-accent/15 text-accent border-accent/30",
  INSTALACAO: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  CONCLUIDO: "bg-success/15 text-success border-success/30",
  CANCELADO: "bg-destructive/15 text-destructive border-destructive/30",
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
}

export const PRIORITY_ORDER: Priority[] = [
  Priority.URGENTE,
  Priority.ALTA,
  Priority.MEDIA,
  Priority.BAIXA,
]

export const PRIORITY_STYLES: Record<Priority, string> = {
  BAIXA: "bg-muted text-muted-foreground border-border",
  MEDIA: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  ALTA: "bg-warning/15 text-warning border-warning/30",
  URGENTE: "bg-destructive/15 text-destructive border-destructive/30",
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  BANCADA_COZINHA: "Bancada de cozinha",
  BANHEIRO: "Banheiro",
  LAVABO: "Lavabo",
  ESCADA: "Escada",
  NICHO: "Nicho",
  SOLEIRA: "Soleira",
  PEITORIL: "Peitoril",
  AREA_GOURMET: "Área gourmet",
  CHURRASQUEIRA: "Churrasqueira",
  PERSONALIZADO: "Projeto personalizado",
  OUTRO: "Outro serviço em pedra",
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
}

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  PENDENTE: "bg-muted text-muted-foreground border-border",
  EM_ANDAMENTO: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  CONCLUIDA: "bg-success/15 text-success border-success/30",
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  MEDICAO: "Medição",
  INSTALACAO: "Instalação",
  VISITA: "Visita",
  ENTREGA: "Entrega",
  OUTRO: "Outro",
}

export const EVENT_TYPE_STYLES: Record<EventType, string> = {
  MEDICAO: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  INSTALACAO: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  VISITA: "bg-accent/15 text-accent border-accent/30",
  ENTREGA: "bg-success/15 text-success border-success/30",
  OUTRO: "bg-muted text-muted-foreground border-border",
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  COLLABORATOR: "Colaborador",
}

export const HISTORY_ACTION_LABELS: Record<HistoryAction, string> = {
  PROJETO_CRIADO: "Projeto criado",
  PROJETO_ATUALIZADO: "Projeto atualizado",
  ETAPA_ALTERADA: "Etapa alterada",
  PRIORIDADE_ALTERADA: "Prioridade alterada",
  RESPONSAVEL_ALTERADO: "Responsável alterado",
  PRAZO_ALTERADO: "Prazo alterado",
  TAREFA_CRIADA: "Tarefa criada",
  TAREFA_ATUALIZADA: "Tarefa atualizada",
  TAREFA_CONCLUIDA: "Tarefa concluída",
  OBSERVACAO_ADICIONADA: "Observação adicionada",
  PROJETO_CONCLUIDO: "Projeto concluído",
  PROJETO_CANCELADO: "Projeto cancelado",
  PROJETO_REATIVADO: "Projeto reativado",
  PROJETO_EXCLUIDO: "Projeto excluído",
  EVENTO_AGENDADO: "Evento agendado",
}
