"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Edit, Trash2, Calendar, Tag, FileText, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { formatDateTime, isOverdue } from "@/lib/utils";
import { TaskForm } from "./TaskForm";

export function TaskDetailModal() {
  const { isDetailModalOpen, selectedTask, closeDetailModal, openEditModal } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  if (!selectedTask) return null;

  const statusConfig = STATUS_CONFIG[selectedTask.status];
  const priorityConfig = PRIORITY_CONFIG[selectedTask.priority];

  const handleDelete = async () => {
    if (!confirm("할 일을 삭제하시겠습니까?")) return;
    await deleteTask.mutateAsync(selectedTask.id);
    closeDetailModal();
  };

  const handleComplete = async () => {
    await updateTask.mutateAsync({
      id: selectedTask.id,
      data: {
        status: selectedTask.status === "DONE" ? "TODO" : "DONE",
        completedAt: selectedTask.status === "DONE" ? null : new Date().toISOString(),
      },
    });
  };

  if (isEditing) {
    return (
      <Dialog open={isDetailModalOpen} onOpenChange={closeDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>할 일 수정</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask}
            onSuccess={() => {
              setIsEditing(false);
              closeDetailModal();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isDetailModalOpen} onOpenChange={closeDetailModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2 pr-6">
            <DialogTitle className="text-lg leading-snug">{selectedTask.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={selectedTask.status.toLowerCase().replace("_", "-") as any} dot>
              {statusConfig.label}
            </Badge>
            <Badge variant={selectedTask.priority.toLowerCase() as any} dot>
              {priorityConfig.label}
            </Badge>
            {selectedTask.category && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: selectedTask.category.color + "20",
                  color: selectedTask.category.color,
                }}
              >
                {selectedTask.category.name}
              </span>
            )}
          </div>

          {/* Description */}
          {selectedTask.description && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedTask.description}
              </p>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {selectedTask.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">마감일</p>
                  <p className={isOverdue(selectedTask.dueDate) && selectedTask.status !== "DONE"
                    ? "text-red-600 font-medium"
                    : "font-medium"
                  }>
                    {format(new Date(selectedTask.dueDate), "yyyy년 M월 d일 (E)", { locale: ko })}
                  </p>
                </div>
              </div>
            )}
            {selectedTask.completedAt && (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">완료일</p>
                  <p className="font-medium text-green-600">
                    {format(new Date(selectedTask.completedAt), "yyyy년 M월 d일", { locale: ko })}
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">생성일</p>
              <p className="font-medium text-xs mt-0.5">
                {formatDateTime(selectedTask.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              className={selectedTask.status === "DONE"
                ? "text-orange-600 border-orange-300 hover:bg-orange-50"
                : "text-green-600 border-green-300 hover:bg-green-50"
              }
              onClick={handleComplete}
              loading={updateTask.isPending}
            >
              <Check className="h-4 w-4" />
              {selectedTask.status === "DONE" ? "미완료로 변경" : "완료 처리"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
              수정
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 ml-auto"
              onClick={handleDelete}
              loading={deleteTask.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
