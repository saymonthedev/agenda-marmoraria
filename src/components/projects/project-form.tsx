"use client"

import { Priority, ProjectType } from "@prisma/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/shared/date-picker"
import { EntityCombobox } from "@/components/shared/entity-combobox"
import { Textarea } from "@/components/ui/textarea"
import { PRIORITY_LABELS, PROJECT_TYPE_LABELS } from "@/lib/labels"
import { projectSchema, type ProjectInput } from "@/lib/validations/project"
import { createProject, updateProject } from "@/server/actions/projects"

type Option = { id: string; name: string }

export function ProjectForm({
  project,
  customers,
  responsibleCandidates,
  memberCandidates,
}: {
  project?: {
    id: string
    name: string
    type: ProjectType
    description: string | null
    customerId: string
    responsibleId: string | null
    priority: Priority
    deadline: Date | null
    members: { userId: string }[]
  }
  customers: Option[]
  responsibleCandidates: Option[]
  memberCandidates: Option[]
}) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      type: project?.type ?? ProjectType.OUTRO,
      customerId: project?.customerId ?? "",
      description: project?.description ?? "",
      responsibleId: project?.responsibleId ?? undefined,
      priority: project?.priority ?? Priority.MEDIA,
      deadline: project?.deadline ? project.deadline.toISOString().slice(0, 10) : undefined,
      memberIds: project?.members.map((m) => m.userId) ?? [],
    },
  })

  async function onSubmit(values: ProjectInput) {
    const result = project ? await updateProject(project.id, values) : await createProject(values)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(project ? "Projeto atualizado com sucesso." : "Projeto criado com sucesso.")
    router.push(`/projetos/${result.data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Nome do projeto</Label>
          <Input
            id="name"
            autoComplete="off"
            placeholder="Ex.: Bancada de cozinha - Residência Silva"
            {...register("name")}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Tipo de serviço</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProjectType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {PROJECT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Cliente</Label>
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => (
              <EntityCombobox
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                options={customers.map((customer) => ({ value: customer.id, label: customer.name }))}
                placeholder="Selecione o cliente"
                searchPlaceholder="Pesquisar cliente..."
                emptyText="Nenhum cliente encontrado."
              />
            )}
          />
          {errors.customerId && (
            <p className="text-sm text-destructive">{errors.customerId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Controller
            control={control}
            name="responsibleId"
            render={({ field }) => (
              <EntityCombobox
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
                options={responsibleCandidates.map((candidate) => ({
                  value: candidate.id,
                  label: candidate.name,
                }))}
                placeholder="Sem responsável definido"
                searchPlaceholder="Pesquisar responsável..."
                emptyText="Nenhum usuário encontrado."
                clearLabel="Sem responsável definido"
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Priority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {PRIORITY_LABELS[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Prazo previsto</Label>
          <Controller
            control={control}
            name="deadline"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecionar prazo"
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Detalhes do material, medidas, acabamento combinado..."
          {...register("description")}
        />
      </div>

      {memberCandidates.length > 0 && (
        <div className="space-y-2">
          <Label>Colaboradores com acesso a este projeto</Label>
          <p className="text-xs text-muted-foreground">
            Colaboradores sem a permissão de ver todos os projetos só enxergam os projetos em que
            são responsáveis ou estão marcados aqui.
          </p>
          <Controller
            control={control}
            name="memberIds"
            render={({ field }) => (
              <div className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                {memberCandidates.map((candidate) => {
                  const checked = field.value?.includes(candidate.id) ?? false
                  return (
                    <label
                      key={candidate.id}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const current = field.value ?? []
                          field.onChange(
                            value
                              ? [...current, candidate.id]
                              : current.filter((id) => id !== candidate.id)
                          )
                        }}
                      />
                      {candidate.name}
                    </label>
                  )
                })}
              </div>
            )}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {project ? "Salvar alterações" : "Criar projeto"}
        </Button>
      </div>
    </form>
  )
}
