import { Navigate, createBrowserRouter } from "react-router"

import { useAuth } from "@/auth/auth-context"
import { DashboardLayout } from "@/pages/dashboard-layout"
import { LoginPage } from "@/pages/login"
import { ResetPasswordPage } from "@/pages/reset-password"
import { UsersPage } from "@/pages/users"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function LoginRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <LoginPage />
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard/users" replace /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
])