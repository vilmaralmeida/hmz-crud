import { useTranslation } from "react-i18next"
import { NavLink } from "react-router"

import brand from "@/assets/images/brand.png"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UsersThreeIcon } from "@phosphor-icons/react"

import { BRAND_FILTER } from "@/lib/brand"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const items = [
    {
      title: t("dashboard.nav.users"),
      url: "/dashboard/users",
      icon: <UsersThreeIcon />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<NavLink to="/dashboard" />}>
              <img
                src={brand}
                alt={t("common.appName")}
                className="h-12 w-auto shrink-0 object-contain group-data-[collapsible=icon]:size-8"
                style={{ filter: BRAND_FILTER }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("dashboard.title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton tooltip={item.title} render={<NavLink to={item.url} />}>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
