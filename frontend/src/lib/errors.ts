import type { TFunction } from "i18next"

import { ApiError } from "@/lib/api"

const MESSAGE_KEYS: Record<string, string> = {
  "Invalid email or password": "errors.invalidCredentials",
  "email is required": "errors.emailRequired",
  "password is required": "errors.passwordRequired",
  "Invalid JSON body": "errors.invalidInput",
  "Invalid id": "errors.invalidId",
  "User not found": "errors.notFound",
  "Invalid or expired token": "errors.invalidToken",
}

const STATUS_KEYS: Record<number, string> = {
  400: "errors.invalidInput",
  401: "errors.invalidCredentials",
  404: "errors.notFound",
  409: "errors.conflict",
}

export function translateApiError(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    const key = MESSAGE_KEYS[error.message] ?? STATUS_KEYS[error.status]
    if (key) {
      return t(key)
    }
  }
  return t("errors.unexpected")
}
