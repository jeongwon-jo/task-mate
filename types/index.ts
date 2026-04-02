export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Theme = "light" | "dark" | "system";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  theme: string;
  workStartTime: string;
  workEndTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  _count?: { tasks: number };
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  content: string;
  userId: string;
  taskId: string | null;
  createdAt: Date;
  updatedAt: Date;
  task?: Pick<Task, "id" | "title"> | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  completedAt: Date | null;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
  tags?: { tag: Tag }[];
  notes?: Note[];
  _count?: { notes: number };
}

export interface Attendance {
  id: string;
  userId: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  categoryId?: string;
  tagIds?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completedAt?: string | null;
}

export interface CreateNoteInput {
  content: string;
  taskId?: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  categoryId?: string;
  search?: string;
  sortBy?: "dueDate" | "createdAt" | "priority" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  todayTasks: Task[];
  totalTasks: number;
  completedToday: number;
  inProgress: number;
  completionRate: number;
  urgentTasks: Task[];
  recentNotes: Note[];
  weeklyStats: { date: string; completed: number; total: number }[];
}

export interface AnalyticsData {
  completionRate: number;
  weeklyProductivity: { week: string; completed: number; total: number }[];
  categoryDistribution: { name: string; value: number; color: string }[];
  priorityDistribution: { priority: Priority; count: number }[];
  dailyActivity: { date: string; completed: number; created: number }[];
  streakDays: number;
  totalCompleted: number;
  avgCompletionTime: number;
}

// Status display config
export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; darkBg: string }
> = {
  TODO: {
    label: "할 일",
    color: "text-blue-700",
    bg: "bg-pastel-blue",
    darkBg: "dark:bg-blue-900/30",
  },
  IN_PROGRESS: {
    label: "진행 중",
    color: "text-orange-700",
    bg: "bg-pastel-orange",
    darkBg: "dark:bg-orange-900/30",
  },
  DONE: {
    label: "완료",
    color: "text-green-700",
    bg: "bg-pastel-green",
    darkBg: "dark:bg-green-900/30",
  },
  CANCELLED: {
    label: "취소",
    color: "text-gray-600",
    bg: "bg-gray-100",
    darkBg: "dark:bg-gray-800/50",
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string; dotColor: string }
> = {
  LOW: {
    label: "낮음",
    color: "text-blue-600",
    bg: "bg-pastel-blue",
    dotColor: "bg-blue-400",
  },
  MEDIUM: {
    label: "보통",
    color: "text-yellow-700",
    bg: "bg-pastel-yellow",
    dotColor: "bg-yellow-400",
  },
  HIGH: {
    label: "높음",
    color: "text-orange-700",
    bg: "bg-pastel-orange",
    dotColor: "bg-orange-400",
  },
  URGENT: {
    label: "긴급",
    color: "text-red-700",
    bg: "bg-pastel-red",
    dotColor: "bg-red-500",
  },
};

export const CATEGORY_COLORS = [
  "#C4B5FD", // 라벤더 퍼플
  "#A5B4FC", // 소프트 인디고
  "#93C5FD", // 스카이 블루
  "#67E8F9", // 민트 시안
  "#6EE7B7", // 소프트 그린
  "#BEF264", // 라임 그린
  "#FDE68A", // 소프트 옐로우
  "#FCA5A5", // 로즈 핑크
  "#F9A8D4", // 베이비 핑크
  "#D9F99D", // 페일 그린
];

export const CATEGORY_ICONS = [
  "folder",
  "briefcase",
  "book",
  "home",
  "heart",
  "star",
  "zap",
  "target",
  "code",
  "music",
  "camera",
  "shopping-cart",
];
