import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Images, 
  Rss, 
  BarChart3, 
  CreditCard, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Link2,
  Settings,
  Plus
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

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Connect", url: "/connect", icon: Link2 },
  { title: "Products", url: "/products", icon: Package },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Create Template", url: "/template-create", icon: Plus },
  { title: "Media Manager", url: "/media", icon: Images },
  { title: "Feed Manager", url: "/feeds", icon: Rss },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "App Settings", url: "/settings/app", icon: Settings },
  { title: "Support", url: "/support", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="overflow-hidden">
        <div className="px-4 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-sidebar-foreground truncate">Boostria</h1>
                <p className="text-xs text-sidebar-foreground/60 truncate">Catalog Manager</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={`flex items-center gap-3 rounded-lg transition-colors min-w-0 ${
                        isCollapsed ? 'px-2 py-2 mx-2 justify-center' : 'px-3 py-2 mx-3'
                      } ${getNavCls(item.url)}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}