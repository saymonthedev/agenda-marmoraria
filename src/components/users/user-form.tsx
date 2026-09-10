"use client"

import { Permission, UserRole } from "@prisma/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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
import { PERMISSION_DESCRIPTIONS, PERMISSION_GROUPS, PERMISSION_LABELS } from "@/lib/permissions"
import { USER_ROLE_LABELS } from "@/lib/labels"
import { createUser, updateUser } from "@/server/actions/users"

const userFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().optional(),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.nativeEnum(Permission)),
})

type UserFormValues = z.infer<typeof userFormSchema>

type UserFormProps = {
  user?: {
    id: string
    name: string
    email: string
    role: UserRole
    permissions: Permission[]
  }
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const router = useRouter()
  const isEdit = !!user

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? UserRole.COLLABORATOR,
      permissions: user?.permissions ?? [],
    },
  })

  const role = useWatch({ control, name: "role" })

  async function onSubmit(values: UserFormValues) {
    if (!isEdit && (!values.password || values.password.length < 8)) {
      setError("password", { message: "A senha deve ter pelo menos 8 caracteres" })
      return
    }

    const result = isEdit
      ? await updateUser({ userId: user.id, ...values })
      : await createUser({ ...values, password: values.password! })

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(isEdit ? "Usuário atualizado com sucesso." : "Usuário criado com sucesso.")
    router.refresh()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" autoComplete="off" placeholder="Nome do usuário" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="off" placeholder="usuario@empresa.com" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      {!isEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha provisória</Label>
          <Input id="password" type="password" autoComplete="off" placeholder="Mínimo 8 caracteres" {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          <p className="text-xs text-muted-foreground">
            Compartilhe esta senha com o usuário. Ele poderá alterá-la depois em &quot;Minha conta&quot;.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Perfil</Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRole).map((r) => (
                  <SelectItem key={r} value={r}>
                    {USER_ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Administradores têm acesso completo ao sistema, incluindo gestão de usuários.
        </p>
      </div>

      {role === UserRole.COLLABORATOR && (
        <div className="space-y-3">
          <Label>Permissões do colaborador</Label>
          <Controller
            control={control}
            name="permissions"
            render={({ field }) => (
              <div className="space-y-4 rounded-lg border border-border p-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {group.title}
                    </p>
                    <div className="space-y-2">
                      {group.permissions.map((permission) => {
                        const checked = field.value?.includes(permission) ?? false
                        return (
                          <label key={permission} className="flex items-start gap-2.5 text-sm">
                            <Checkbox
                              className="mt-0.5"
                              checked={checked}
                              onCheckedChange={(value) => {
                                const current = field.value ?? []
                                field.onChange(
                                  value
                                    ? [...current, permission]
                                    : current.filter((p) => p !== permission)
                                )
                              }}
                            />
                            <span>
                              <span className="block font-medium text-foreground">
                                {PERMISSION_LABELS[permission]}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {PERMISSION_DESCRIPTIONS[permission]}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Salvar alterações" : "Criar usuário"}
        </Button>
      </div>
    </form>
  )
}
