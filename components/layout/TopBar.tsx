"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Zap } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed } = useUIStore();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 lg:px-6 transition-all duration-300",
        "left-0 lg:left-60",
        sidebarCollapsed && "lg:left-16"
      )}
    >
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-paperlogy text-lg font-bold text-brand-600">Taskmate</span>
      </div>

      {/* Desktop title */}
      {title && (
        <h1 className="hidden lg:block font-paperlogy text-xl font-semibold text-foreground">
          {title}
        </h1>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                {session?.user?.name ?? session?.user?.email}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">설정</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-600 dark:text-red-400 focus:text-red-600"
            >
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
