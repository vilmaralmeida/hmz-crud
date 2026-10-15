import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import { useAuth } from "@/auth/auth-context"
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
import { api } from "@/lib/api"
import { translateApiError } from "@/lib/errors"

type SignUpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SignUpForm = {
  first_name: string
  last_name: string
  email: string
  password: string
  confirm_password: string
}

const emptyForm: SignUpForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
}

export function SignUpDialog({ open, onOpenChange }: SignUpDialogProps) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<SignUpForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(false)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setForm(emptyForm)
      setError(null)
      setSubmitting(false)
    }
  }

  function set<K extends keyof SignUpForm>(key: K, value: string) {
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
      await api.create({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      })
      await login(form.email, form.password)
      void navigate("/dashboard", { replace: true })
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
            <DialogTitle>{t("login.signUp")}</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="sign_up_first_name">{t("users.firstName")}</FieldLabel>
                <Input
                  id="sign_up_first_name"
                  value={form.first_name}
                  onChange={(event) => set("first_name", event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="sign_up_last_name">{t("users.lastName")}</FieldLabel>
                <Input
                  id="sign_up_last_name"
                  value={form.last_name}
                  onChange={(event) => set("last_name", event.target.value)}
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="sign_up_email">{t("login.email")}</FieldLabel>
              <Input
                id="sign_up_email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="sign_up_password">{t("login.password")}</FieldLabel>
                <Input
                  id="sign_up_password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => set("password", event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="sign_up_confirm_password">
                  {t("users.confirmPassword")}
                </FieldLabel>
                <Input
                  id="sign_up_confirm_password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm_password}
                  onChange={(event) => set("confirm_password", event.target.value)}
                  required
                />
              </Field>
            </div>
          </FieldGroup>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("users.creating") : t("login.signUp")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
