"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "홈", icon: LayoutDashboard },
  { href: "/tasks", label: "할 일", icon: CheckSquare },
  { href: "/calendar", label: "캘린더", icon: Calendar },
  { href: "/analytics", label: "통계", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive ? "text-brand-600" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-brand-600")} />
              <span className={cn("text-[10px] font-medium", isActive && "text-brand-600")}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
