"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/tasks", label: "할 일", icon: CheckSquare },
  { href: "/calendar", label: "캘린더", icon: Calendar },
  { href: "/analytics", label: "통계", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 bg-white dark:bg-gray-900 border-r border-border transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-border", sidebarCollapsed && "justify-center")}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-paperlogy text-lg font-bold text-brand-600">
              Taskmate
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                sidebarCollapsed && "justify-center px-2"
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-brand-600")} />
              {!sidebarCollapsed && <span>{label}</span>}
              {isActive && !sidebarCollapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-1 border-t border-border pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all duration-150",
            sidebarCollapsed && "justify-center px-2"
          )}
          title={sidebarCollapsed ? "로그아웃" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && <span>로그아웃</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150",
            sidebarCollapsed && "justify-center px-2"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>접기</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
