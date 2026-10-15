import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import brand from "@/assets/images/brand.png"
import { useAuth } from "@/auth/auth-context"
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog"
import { SignUpDialog } from "@/components/sign-up-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { translateApiError } from "@/lib/errors"
import { BRAND_FILTER } from "@/lib/brand"

export function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      void navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(translateApiError(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-center p-10 lg:flex">
        <h1 className="ml-10 font-heading text-8xl font-medium tracking-tight leading-snug whitespace-pre-line">
          {t("login.tagline")}
        </h1>
        <p className="absolute inset-x-10 bottom-10 text-center text-xs text-muted-foreground">
          {t("login.signature")}
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
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

            <FieldGroup>
              <Field>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-label={t("login.email")}
                  placeholder={t("login.email")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-label={t("login.password")}
                  placeholder={t("login.password")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            {error ? <FieldError>{error}</FieldError> : null}

            <div className="flex flex-col gap-8">
              <Button type="submit" disabled={submitting}>
                {submitting ? t("login.submitting") : t("login.submit")}
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setForgotOpen(true)}
                >
                  {t("login.forgotPassword")}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setSignUpOpen(true)}
                >
                  {t("login.signUp")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
      <SignUpDialog open={signUpOpen} onOpenChange={setSignUpOpen} />
    </div>
  )
}
