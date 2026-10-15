import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router"

import brand from "@/assets/images/brand.png"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { BRAND_FILTER } from "@/lib/brand"
import { translateApiError } from "@/lib/errors"

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm_password, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirm_password) {
      setError(t("users.passwordMismatch"))
      return
    }

    setSubmitting(true)
    try {
      await api.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(translateApiError(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 border border-border p-8"
        >
          <img
            src={brand}
            alt={t("common.appName")}
            className="mx-auto h-28 w-auto"
            style={{ filter: BRAND_FILTER }}
          />

          <h1 className="font-heading text-lg font-medium">{t("reset.title")}</h1>

          {done ? (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">{t("reset.success")}</p>
              <Button type="button" onClick={() => navigate("/login", { replace: true })}>
                {t("reset.goToLogin")}
              </Button>
            </div>
          ) : (
            <>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="new_password">{t("login.password")}</FieldLabel>
                  <Input
                    id="new_password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new_confirm_password">
                    {t("users.confirmPassword")}
                  </FieldLabel>
                  <Input
                    id="new_confirm_password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm_password}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </Field>
              </FieldGroup>

              {error ? <FieldError>{error}</FieldError> : null}

              <Button type="submit" disabled={submitting}>
                {submitting ? t("reset.submitting") : t("reset.submit")}
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
