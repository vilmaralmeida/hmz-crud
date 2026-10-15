import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field"
import { api, type User } from "@/lib/api"
import { translateApiError } from "@/lib/errors"

type UserViewDialogProps = {
  slug: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(value: string) {
  const normalized = value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00")
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("pt-BR")
}

export function UserViewDialog({ slug, open, onOpenChange }: UserViewDialogProps) {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !slug) {
      return
    }

    let active = true
    setLoading(true)
    setError(null)
    api
      .getBySlug(slug)
      .then((data) => {
        if (active) setUser(data)
      })
      .catch((err) => {
        if (active) setError(translateApiError(err, t))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, slug, t])

  const name = user ? `${user.first_name} ${user.last_name}`.trim() : ""
  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("users.details")}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
        ) : error ? (
          <FieldError>{error}</FieldError>
        ) : user ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                {user.avatar ? <AvatarImage src={user.avatar} alt={name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid">
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <dl className="grid gap-2">
              {[
                { label: t("users.email"), value: user.email },
                {
                  label: t("users.createdAt"),
                  value: formatDate(user.created_at),
                },
                {
                  label: t("users.updatedAt"),
                  value: formatDate(user.updated_at),
                },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-2">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="break-all">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
