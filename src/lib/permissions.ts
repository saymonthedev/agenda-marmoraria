import { Permission } from "@prisma/client"

export const ALL_PERMISSIONS = Object.values(Permission)

export const PERMISSION_LABELS: Record<Permission, string> = {
  PROJECTS_VIEW_ALL: "Visualizar todos os projetos",
  PROJECTS_CREATE: "Criar projetos",
  PROJECTS_EDIT: "Editar projetos",
  PROJECTS_DELETE: "Excluir ou desativar projetos",
  PROJECTS_CHANGE_STAGE: "Alterar etapa dos projetos",
  CUSTOMERS_MANAGE: "Gerenciar clientes",
  TASKS_MANAGE: "Gerenciar tarefas",
  AGENDA_MANAGE: "Gerenciar agenda",
  USERS_MANAGE: "Gerenciar usuários",
  HISTORY_VIEW: "Visualizar histórico completo",
  SETTINGS_MANAGE: "Gerenciar configurações",
}

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  PROJECTS_VIEW_ALL:
    "Sem esta permissão, o colaborador só enxerga projetos em que é responsável ou está adicionado como membro.",
  PROJECTS_CREATE: "Permite criar novos projetos no sistema.",
  PROJECTS_EDIT: "Permite editar informações de projetos já existentes.",
  PROJECTS_DELETE: "Permite desativar ou excluir projetos.",
  PROJECTS_CHANGE_STAGE: "Permite mover projetos entre etapas (inclusive pelo Kanban).",
  CUSTOMERS_MANAGE: "Permite cadastrar, editar e remover clientes.",
  TASKS_MANAGE: "Permite criar, atribuir e concluir tarefas dos projetos.",
  AGENDA_MANAGE: "Permite criar e editar eventos na agenda.",
  USERS_MANAGE: "Permite gerenciar usuários e permissões. Recomendado apenas para administradores.",
  HISTORY_VIEW: "Permite visualizar o histórico de atividades dos projetos.",
  SETTINGS_MANAGE: "Permite alterar configurações gerais do sistema.",
}

export const PERMISSION_GROUPS: { title: string; permissions: Permission[] }[] = [
  {
    title: "Projetos",
    permissions: [
      Permission.PROJECTS_VIEW_ALL,
      Permission.PROJECTS_CREATE,
      Permission.PROJECTS_EDIT,
      Permission.PROJECTS_DELETE,
      Permission.PROJECTS_CHANGE_STAGE,
    ],
  },
  {
    title: "Operação",
    permissions: [Permission.CUSTOMERS_MANAGE, Permission.TASKS_MANAGE, Permission.AGENDA_MANAGE],
  },
  {
    title: "Administração",
    permissions: [Permission.USERS_MANAGE, Permission.HISTORY_VIEW, Permission.SETTINGS_MANAGE],
  },
]
