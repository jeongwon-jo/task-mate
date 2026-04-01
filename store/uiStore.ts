import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  attendanceNotificationDismissed: boolean;

  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  dismissAttendanceNotification: () => void;
  resetAttendanceNotification: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      attendanceNotificationDismissed: false,

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setMobileSidebarOpen: (open) =>
        set({ mobileSidebarOpen: open }),

      dismissAttendanceNotification: () =>
        set({ attendanceNotificationDismissed: true }),

      resetAttendanceNotification: () =>
        set({ attendanceNotificationDismissed: false }),
    }),
    {
      name: "taskmate-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
