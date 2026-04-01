import { create } from "zustand";
import { Task, TaskFilters, TaskStatus, Priority } from "@/types";

interface TaskStore {
  filters: TaskFilters;
  selectedTask: Task | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDetailModalOpen: boolean;

  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  setSelectedTask: (task: Task | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
  openDetailModal: (task: Task) => void;
  closeDetailModal: () => void;
}

const defaultFilters: TaskFilters = {
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};

export const useTaskStore = create<TaskStore>((set) => ({
  filters: defaultFilters,
  selectedTask: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDetailModalOpen: false,

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters, page: 1 },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setSelectedTask: (task) => set({ selectedTask: task }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openEditModal: (task) => set({ isEditModalOpen: true, selectedTask: task }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedTask: null }),

  openDetailModal: (task) =>
    set({ isDetailModalOpen: true, selectedTask: task }),
  closeDetailModal: () =>
    set({ isDetailModalOpen: false, selectedTask: null }),
}));
