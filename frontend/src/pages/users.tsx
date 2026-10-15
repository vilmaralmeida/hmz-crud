import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router"

import { UserFormDialog } from "@/components/user-form-dialog"
import { UserViewDialog } from "@/components/user-view-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUsers } from "@/hooks/use-users"
import type { User, UserInput } from "@/lib/api"
import { EyeIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

function initialsOf(user: User) {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
}

export function UsersPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const { users, totalPages, total, loading, error, create, update, remove } = useUsers(page)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [viewing, setViewing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  function setPage(next: number) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set("page", String(next))
      return params
    })
  }

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setDialogOpen(true)
  }

  async function handleSubmit(input: UserInput) {
    if (editing) {
      await update(editing.id, input)
      toast.success(t("users.updated"))
    } else {
      await create(input)
      toast.success(t("users.created"))
    }
  }

  async function confirmDelete() {
    if (!deleting) {
      return
    }
    setDeletePending(true)
    try {
      await remove(deleting.id)
      setDeleting(null)
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("users.title")}</CardTitle>
        <CardAction>
          <Button onClick={openCreate}>
            <PlusIcon />
            {t("users.new")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {error ? <FieldError>{error}</FieldError> : null}

        {loading ? (
          <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
        ) : users.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("users.empty")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">{t("users.columns.id")}</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">{t("users.columns.avatar")}</span>
                </TableHead>
                <TableHead>{t("users.columns.user")}</TableHead>
                <TableHead>{t("users.columns.email")}</TableHead>
                <TableHead className="text-right">{t("users.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const name = `${user.first_name} ${user.last_name}`
                return (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground">{user.id}</TableCell>
                    <TableCell>
                      <Avatar size="sm">
                        {user.avatar ? <AvatarImage src={user.avatar} alt={name} /> : null}
                        <AvatarFallback>{initialsOf(user)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-600"
                          aria-label={t("users.view")}
                          onClick={() => setViewing(user)}
                        >
                          <EyeIcon />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-yellow-500 hover:text-yellow-500"
                          aria-label={t("common.edit")}
                          onClick={() => openEdit(user)}
                        >
                          <PencilSimpleIcon />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={t("common.remove")}
                          onClick={() => setDeleting(user)}
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t("users.pagination.page", { page, total: totalPages })} · {total}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {t("users.pagination.previous")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("users.pagination.next")}
            </Button>
          </div>
        </div>
      </CardContent>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        onSubmit={handleSubmit}
        onDelete={
          editing
            ? () => {
                const target = editing
                setDialogOpen(false)
                setDeleting(target)
              }
            : undefined
        }
      />

      <UserViewDialog
        slug={viewing?.slug ?? null}
        open={viewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null)
        }}
      />

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("users.confirmDelete", { email: deleting?.email ?? "" })}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePending}
              onClick={() => void confirmDelete()}
            >
              {t("common.remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
