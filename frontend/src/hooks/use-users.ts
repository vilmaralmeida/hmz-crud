import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { api, type Paginated, type User, type UserInput } from "@/lib/api"
import { translateApiError } from "@/lib/errors"

const PER_PAGE = 10

export function useUsers(page: number) {
  const { t } = useTranslation()
  const [result, setResult] = useState<Paginated<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true)
      try {
        const data = await api.list(targetPage, PER_PAGE)
        setResult(data)
        setError(null)
      } catch (err) {
        setError(translateApiError(err, t))
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  useEffect(() => {
    void load(page)
  }, [load, page])

  const refresh = useCallback(() => load(page), [load, page])

  const create = useCallback(
    async (input: UserInput) => {
      await api.create(input)
      await refresh()
    },
    [refresh]
  )

  const update = useCallback(
    async (id: string, input: Partial<UserInput>) => {
      await api.update(id, input)
      await refresh()
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      await api.remove(id)
      await refresh()
    },
    [refresh]
  )

  return {
    users: result?.data ?? [],
    totalPages: result?.total_pages ?? 1,
    total: result?.total ?? 0,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  }
}
