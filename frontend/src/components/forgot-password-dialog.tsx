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
import { api } from "@/lib/api"
import { translateApiError } from "@/lib/errors"

type ForgotPasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [wasOpen, setWasOpen] = useState(false)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setEmail("")
      setError(null)
      setSent(false)
      setSubmitting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(translateApiError(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("login.forgotPassword")}</DialogTitle>
        </DialogHeader>

        {sent ? (
          <p className="text-xs text-muted-foreground">{t("login.forgotPasswordSent")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="forgotEmail">{t("login.email")}</FieldLabel>
                <Input
                  id="forgotEmail"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t("login.sending") : t("login.send")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
