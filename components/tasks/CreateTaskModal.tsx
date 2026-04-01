"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useTaskStore } from "@/store/taskStore";

export function CreateTaskModal() {
  const { isCreateModalOpen, closeCreateModal } = useTaskStore();

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 할 일 추가</DialogTitle>
        </DialogHeader>
        <TaskForm onSuccess={closeCreateModal} onCancel={closeCreateModal} />
      </DialogContent>
    </Dialog>
  );
}
