import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  Boxes,
  ShoppingBag,
  Calendar,
  BarChart3,
  Settings,
  Glasses,
  Watch,
  FileText,
  Wrench,
  CreditCard
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    group: "principal"
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    group: "principal"
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Package,
    group: "catalogo"
  },
  {
    title: "Armações",
    url: "/armacoes",
    icon: Glasses,
    group: "catalogo"
  },
  {
    title: "Lentes",
    url: "/lentes",
    icon: Package,
    group: "catalogo"
  },
  {
    title: "Relógios",
    url: "/relogios",
    icon: Watch,
    group: "catalogo"
  },
  {
    title: "PDV / Vendas",
    url: "/vendas",
    icon: ShoppingCart,
    group: "vendas"
  },
  {
    title: "Orçamentos",
    url: "/orcamentos",
    icon: FileText,
    group: "vendas"
  },
  {
    title: "Prescrições",
    url: "/prescricoes",
    icon: FileText,
    group: "optica"
  },
  {
    title: "Montagem",
    url: "/montagem",
    icon: Wrench,
    group: "optica"
  },
  {
    title: "OS Relojoaria",
    url: "/os-relojoaria",
    icon: ClipboardList,
    group: "relojoaria"
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: Boxes,
    group: "gestao"
  },
  {
    title: "Compras",
    url: "/compras",
    icon: ShoppingBag,
    group: "gestao"
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: CreditCard,
    group: "gestao"
  },
  {
    title: "Agenda",
    url: "/agenda",
    icon: Calendar,
    group: "atendimento"
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
    group: "gestao"
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    group: "sistema"
  }
];

const menuGroups = {
  principal: "Principal",
  catalogo: "Catálogo",
  vendas: "Vendas",
  optica: "Ótica",
  relojoaria: "Relojoaria",
  atendimento: "Atendimento",
  gestao: "Gestão",
  sistema: "Sistema"
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `sidebar-item px-3 py-2 ${isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground hover:text-sidebar-primary"}`;

  // Agrupar itens do menu
  const groupedItems = Object.entries(menuGroups).map(([groupKey, groupLabel]) => ({
    key: groupKey,
    label: groupLabel,
    items: menuItems.filter(item => item.group === groupKey)
  }));

  return (
    <Sidebar 
      className={`pt-14 ${state === "collapsed" ? "w-16" : "w-64"}`}
    >
      <SidebarContent className="px-2">
        {groupedItems.map(group => (
          group.items.length > 0 && (
            <SidebarGroup key={group.key}>
              {state !== "collapsed" && (
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.url === "/"} 
                          className={getNavCls}
                        >
                          <item.icon className={`${state === "collapsed" ? "mx-auto" : "mr-3"} h-4 w-4`} />
                          {state !== "collapsed" && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        ))}
      </SidebarContent>
    </Sidebar>
  );
}