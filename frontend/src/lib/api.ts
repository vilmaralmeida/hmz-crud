export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar: string | null
  slug: string
  created_at: string
  updated_at: string
}

export type UserInput = {
  email: string
  first_name: string
  last_name: string
  avatar?: string | null
  slug?: string
  password?: string
}

export type Session = {
  token: string
  id: string
}

export type Paginated<T> = {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: T[]
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "")

export const SESSION_STORAGE_KEY = "hmz.session"

function basicAuth(email: string, password: string) {
  const bytes = new TextEncoder().encode(`${email}:${password}`)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return `Basic ${btoa(binary)}`
}

function readSessionToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const session = JSON.parse(raw) as { token?: string }
    return session.token ?? null
  } catch {
    return null
  }
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type RequestOptions = {
  method?: string
  body?: string
  headers?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = readSessionToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method,
    body: options.body,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 204) {
    return undefined as T
  }

  const body: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      window.location.assign("/login")
    }
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed (${res.status})`
    throw new ApiError(res.status, message)
  }

  return body as T
}

export const api = {
  login: (input: { email: string; password: string }) =>
    request<Session>("/login", {
      method: "POST",
      headers: { Authorization: basicAuth(input.email, input.password) },
    }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean }>("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ ok: boolean }>("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  list: (page = 1, perPage = 10) =>
    request<Paginated<User>>(`/users?page=${page}&per_page=${perPage}`),
  get: (identifier: string) =>
    request<{ data: User }>(`/users/${identifier}`).then((r) => r.data),
  getBySlug: (slug: string) =>
    request<{ data: User }>(`/users/${slug}`).then((r) => r.data),
  create: (input: UserInput) =>
    request<{ data: User }>("/users", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.data),
  update: (id: string, input: Partial<UserInput>) =>
    request<{ data: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }).then((r) => r.data),
  remove: (id: string) => request<void>(`/users/${id}`, { method: "DELETE" }),
}