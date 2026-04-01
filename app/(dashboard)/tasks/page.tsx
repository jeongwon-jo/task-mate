"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, Search, Filter, SortAsc, LayoutGrid, List, X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "@/components/tasks/TaskCard";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { useTaskStore } from "@/store/taskStore";
import { useTasks } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus, Priority } from "@/types";

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export default function TasksPage() {
  const { filters, setFilters, openCreateModal } = useTaskStore();
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data, isLoading } = useTasks(filters);
  const tasks: Task[] = data?.tasks ?? [];
  const total = data?.total ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput });
  };

  const clearFilter = (key: keyof typeof filters) => {
    setFilters({ [key]: undefined });
    if (key === "search") setSearchInput("");
  };

  const activeFilters = [
    filters.status && { key: "status", label: `상태: ${statusLabel(filters.status)}` },
    filters.priority && { key: "priority", label: `우선순위: ${priorityLabel(filters.priority)}` },
    filters.categoryId && { key: "categoryId", label: `카테고리 필터` },
    filters.search && { key: "search", label: `검색: ${filters.search}` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <DashboardLayout title="할 일">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-paperlogy text-2xl font-bold">할 일 목록</h2>
          <p className="text-sm text-muted-foreground">
            전체 {total}개 항목
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          새 할 일
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              placeholder="할 일 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* View toggle */}
          <div className="hidden sm:flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-brand-600 text-white" : "hover:bg-accent"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-brand-600 text-white" : "hover:bg-accent"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) => setFilters({ status: v === "all" ? undefined : v as TaskStatus })}
          >
            <SelectTrigger className="h-8 w-auto text-xs px-3">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="TODO">할 일</SelectItem>
              <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
              <SelectItem value="DONE">완료</SelectItem>
              <SelectItem value="CANCELLED">취소</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority ?? "all"}
            onValueChange={(v) => setFilters({ priority: v === "all" ? undefined : v as Priority })}
          >
            <SelectTrigger className="h-8 w-auto text-xs px-3">
              <SelectValue placeholder="우선순위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 우선순위</SelectItem>
              <SelectItem value="URGENT">긴급</SelectItem>
              <SelectItem value="HIGH">높음</SelectItem>
              <SelectItem value="MEDIUM">보통</SelectItem>
              <SelectItem value="LOW">낮음</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.categoryId ?? "all"}
            onValueChange={(v) => setFilters({ categoryId: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="h-8 w-auto text-xs px-3">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
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

          <Select
            value={`${filters.sortBy ?? "createdAt"}_${filters.sortOrder ?? "desc"}`}
            onValueChange={(v) => {
              const [sortBy, sortOrder] = v.split("_") as [typeof filters.sortBy, typeof filters.sortOrder];
              setFilters({ sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="h-8 w-auto text-xs px-3">
              <SortAsc className="h-3 w-3 mr-1" />
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">최신순</SelectItem>
              <SelectItem value="createdAt_asc">오래된순</SelectItem>
              <SelectItem value="dueDate_asc">마감일순</SelectItem>
              <SelectItem value="priority_desc">우선순위 높은순</SelectItem>
              <SelectItem value="title_asc">제목 가나다순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filter badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <Badge
                key={f.key}
                variant="default"
                className="gap-1 cursor-pointer"
                onClick={() => clearFilter(f.key as keyof typeof filters)}
              >
                {f.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <button
              onClick={() => {
                setFilters({
                  status: undefined,
                  priority: undefined,
                  categoryId: undefined,
                  search: undefined,
                });
                setSearchInput("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              전체 초기화
            </button>
          </div>
        )}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 gap-3" : "space-y-3"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-16 w-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-brand-400" />
          </div>
          <h3 className="font-medium text-foreground mb-1">할 일이 없어요</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {activeFilters.length > 0
              ? "필터를 변경하거나 초기화해보세요"
              : "새 할 일을 추가해보세요"}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            할 일 추가
          </Button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 gap-3" : "space-y-3"}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <CreateTaskModal />
      <TaskDetailModal />
    </DashboardLayout>
  );
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    TODO: "할 일", IN_PROGRESS: "진행 중", DONE: "완료", CANCELLED: "취소",
  };
  return map[s] ?? s;
}

function priorityLabel(p: string) {
  const map: Record<string, string> = {
    LOW: "낮음", MEDIUM: "보통", HIGH: "높음", URGENT: "긴급",
  };
  return map[p] ?? p;
}
