import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { User, UserInput } from "@/lib/api"
import { translateApiError } from "@/lib/errors"
import { TrashIcon } from "@phosphor-icons/react"

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSubmit: (input: UserInput) => Promise<void>
  onDelete?: () => void
}

type FormValues = {
  email: string
  first_name: string
  last_name: string
  avatar: string
  password: string
  confirm_password: string
}

const emptyForm: FormValues = {
  email: "",
  first_name: "",
  last_name: "",
  avatar: "",
  password: "",
  confirm_password: "",
}

export function UserFormDialog({ open, onOpenChange, user, onSubmit, onDelete }: UserFormDialogProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormValues>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [renderedFor, setRenderedFor] = useState<string | null>(null)

  const target = user?.id ?? "new"
  if (open && renderedFor !== target) {
    setRenderedFor(target)
    setForm(
      user
        ? {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar ?? "",
            password: "",
            confirm_password: "",
          }
        : emptyForm
    )
    setError(null)
  }

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (form.password !== form.confirm_password) {
      setError(t("users.passwordMismatch"))
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        avatar: form.avatar.trim() ? form.avatar : null,
        ...(form.password ? { password: form.password } : {}),
      })
      onOpenChange(false)
    } catch (err) {
      setError(translateApiError(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{user ? t("common.edit") : t("users.add")}</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="first_name">{t("users.firstName")}</FieldLabel>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(event) => set("first_name", event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="last_name">{t("users.lastName")}</FieldLabel>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(event) => set("last_name", event.target.value)}
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="email">{t("users.email")}</FieldLabel>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="avatar">{t("users.avatar")}</FieldLabel>
              <Input
                id="avatar"
                value={form.avatar}
                onChange={(event) => set("avatar", event.target.value)}
                placeholder={t("users.avatarPlaceholder")}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="password">{t("users.password")}</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => set("password", event.target.value)}
                  required={!user}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm_password">
                  {t("users.confirmPassword")}
                </FieldLabel>
                <Input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm_password}
                  onChange={(event) => set("confirm_password", event.target.value)}
                  required={!user}
                />
              </Field>
            </div>
          </FieldGroup>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <DialogFooter className="mt-6">
            {user && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                className="mr-auto"
                disabled={submitting}
                onClick={onDelete}
              >
                <TrashIcon />
                {t("common.remove")}
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("users.creating") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
