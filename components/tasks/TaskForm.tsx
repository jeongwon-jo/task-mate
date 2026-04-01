"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, Priority } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const isEditing = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: (task?.status ?? "TODO") as TaskStatus,
    priority: (task?.priority ?? "MEDIUM") as Priority,
    dueDate: task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
    categoryId: task?.categoryId ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "제목을 입력해주세요";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreateTaskInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      categoryId: form.categoryId || undefined,
    };

    if (isEditing) {
      await updateTask.mutateAsync({ id: task!.id, data });
    } else {
      await createTask.mutateAsync(data);
    }
    onSuccess?.();
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">제목 *</label>
        <Input
          placeholder="할 일을 입력해주세요"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={errors.title ? "border-red-400 focus-visible:ring-red-400" : ""}
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">설명</label>
        <Textarea
          placeholder="상세 내용을 입력해주세요 (선택)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">상태</label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">할 일</SelectItem>
              <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
              <SelectItem value="DONE">완료</SelectItem>
              <SelectItem value="CANCELLED">취소</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">우선순위</label>
          <Select
            value={form.priority}
            onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">낮음</SelectItem>
              <SelectItem value="MEDIUM">보통</SelectItem>
              <SelectItem value="HIGH">높음</SelectItem>
              <SelectItem value="URGENT">긴급</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">마감일</label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            min={format(new Date(), "yyyy-MM-dd")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">카테고리</label>
          <Select
            value={form.categoryId || "none"}
            onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택 안함" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">선택 안함</SelectItem>
              {categories.map((cat: { id: string; name: string; color: string }) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          {isEditing ? "수정하기" : "추가하기"}
        </Button>
      </div>
    </form>
  );
}
