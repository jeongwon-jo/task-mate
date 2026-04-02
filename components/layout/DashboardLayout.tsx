"use client";

import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TopBar } from "./TopBar";
import { AttendanceWidget } from "@/components/attendance/AttendanceWidget";
import { UserTypeModal } from "@/components/UserTypeModal";
import { NotificationManager } from "@/components/NotificationManager";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar title={title} />
      <main
        className={cn(
          "transition-all duration-300 pt-16 pb-20 lg:pb-6 min-h-screen",
          "lg:pl-60",
          sidebarCollapsed && "lg:pl-16"
        )}
      >
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
      <AttendanceWidget />
      <UserTypeModal />
      <NotificationManager />
    </div>
  );
}
