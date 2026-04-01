import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ko } from "date-fns/locale";
import { Priority } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "오늘";
  if (isTomorrow(d)) return "내일";
  return format(d, "M월 d일", { locale: ko });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy.MM.dd HH:mm", { locale: ko });
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ko });
}

export function isOverdue(dueDate: Date | string | null): boolean {
  if (!dueDate) return false;
  const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return isPast(d) && !isToday(d);
}

export function priorityToNumber(priority: Priority): number {
  const map: Record<Priority, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
  };
  return map[priority];
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateColor(index: number): string {
  const colors = [
    "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
    "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
    "#F97316", "#6366F1",
  ];
  return colors[index % colors.length];
}

export function getDueDateColor(dueDate: Date | string | null, status: string): string {
  if (!dueDate || status === "DONE" || status === "CANCELLED") return "";
  const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (isPast(d) && !isToday(d)) return "text-red-600 dark:text-red-400";
  if (isToday(d)) return "text-orange-600 dark:text-orange-400";
  return "text-muted-foreground";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function formatTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm");
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
