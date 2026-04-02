"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Tag, MoreHorizontal, Check, Edit, Trash2, Circle } from "lucide-react";
import { Task, STATUS_CONFIG, PRIORITY_CONFIG } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate, isOverdue, getDueDateColor } from "@/lib/utils";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { openEditModal, openDetailModal } = useTaskStore();

  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate);
  const dueDateColor = getDueDateColor(task.dueDate, task.status);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask.mutate({
      id: task.id,
      data: {
        status: task.status === "DONE" ? "TODO" : "DONE",
        completedAt: task.status === "DONE" ? null : new Date().toISOString(),
      },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("할 일을 삭제하시겠습니까?")) {
      deleteTask.mutate(task.id);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-card-hover cursor-pointer",
        task.status === "DONE" && "opacity-60",
        compact && "p-3"
      )}
      onClick={() => openDetailModal(task)}
    >
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5 transition-all duration-200",
          task.status === "DONE"
            ? "bg-brand-600 border-brand-600 text-white"
            : "border-gray-300 hover:border-brand-400"
        )}
      >
        {task.status === "DONE" && <Check className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm font-medium leading-snug",
              task.status === "DONE" && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h4>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 shrink-0 h-7 w-7"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => openEditModal(task)}>
                <Edit className="h-4 w-4 mr-2" /> 수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" /> 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!compact && task.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Priority */}
          <Badge variant={task.priority.toLowerCase() as any} dot className="text-[10px] py-0.5">
            {priorityConfig.label}
          </Badge>

          {/* Status */}
          <Badge variant={task.status.toLowerCase().replace("_", "-") as any} className="text-[10px] py-0.5">
            {statusConfig.label}
          </Badge>

          {/* Category */}
          {task.category && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: task.category.color + "20",
                color: task.category.color,
              }}
            >
              {task.category.name}
            </span>
          )}

          {/* Due date */}
          {task.dueDate && (
            <span className={cn("inline-flex items-center gap-1 text-[11px]", dueDateColor)}>
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
              {overdue && task.status !== "DONE" && " · 기한 초과"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
