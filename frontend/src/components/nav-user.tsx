import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import { useAuth } from "@/auth/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutIcon } from "@phosphor-icons/react"

export function NavUser() {
  const { t } = useTranslation()
  const { user, session, logout } = useAuth()
  const navigate = useNavigate()

  const email = user?.email ?? session?.email ?? ""
  const name = user ? `${user.first_name} ${user.last_name}`.trim() : email
  const initials = (
    user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : email.slice(0, 2)
  ).toUpperCase()

  function handleLogout() {
    logout()
    void navigate("/login", { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={name} />}
      >
        <Avatar size="sm">
          {user?.avatar ? <AvatarImage src={user.avatar} alt={name} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                {user?.avatar ? <AvatarImage src={user.avatar} alt={name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-muted-foreground">{email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <SignOutIcon />
            <span>{t("dashboard.userMenu.logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
