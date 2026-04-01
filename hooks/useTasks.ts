import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from "@/types";

const TASKS_KEY = "tasks";

async function fetchTasks(filters: TaskFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/tasks?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

async function fetchTask(id: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

async function createTask(data: CreateTaskInput): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

async function updateTask({
  id,
  data,
}: {
  id: string;
  data: UpdateTaskInput;
}): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: () => fetchTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.setQueryData([TASKS_KEY, data.id], data);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
