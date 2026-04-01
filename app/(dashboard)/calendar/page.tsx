"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { useTaskStore } from "@/store/taskStore";
import { Task, PRIORITY_CONFIG } from "@/types";

async function fetchAllTasks(): Promise<{ tasks: Task[] }> {
  const res = await fetch("/api/tasks?limit=500");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#93C5FD",
  MEDIUM: "#FCD34D",
  HIGH: "#FB923C",
  URGENT: "#F87171",
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "#60A5FA",
  IN_PROGRESS: "#FB923C",
  DONE: "#4ADE80",
  CANCELLED: "#9CA3AF",
};

export default function CalendarPage() {
  const { openCreateModal, openDetailModal } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarRef, setCalendarRef] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", { limit: 500 }],
    queryFn: fetchAllTasks,
  });

  const tasks = data?.tasks ?? [];

  const events = useMemo(() =>
    tasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t.id,
        title: t.title,
        date: format(new Date(t.dueDate!), "yyyy-MM-dd"),
        backgroundColor: STATUS_COLORS[t.status] + "CC",
        borderColor: STATUS_COLORS[t.status],
        textColor:
          t.status === "DONE" ? "#166534" :
          t.status === "IN_PROGRESS" ? "#9A3412" :
          t.status === "CANCELLED" ? "#374151" : "#1E3A5F",
        extendedProps: { task: t },
        classNames: [
          "cursor-pointer",
          t.status === "DONE" ? "opacity-60" : "",
        ],
      })),
    [tasks]
  );

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return tasks.filter(
      (t) => t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === dateStr
    );
  }, [selectedDate, tasks]);

  const handleEventClick = useCallback((info: any) => {
    const task = info.event.extendedProps.task as Task;
    openDetailModal(task);
  }, [openDetailModal]);

  const handleDateClick = useCallback((info: any) => {
    setSelectedDate(new Date(info.date));
  }, []);

  return (
    <DashboardLayout title="캘린더">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-paperlogy text-2xl font-bold">캘린더</h2>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          할 일 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="h-[500px] bg-muted animate-pulse rounded-xl" />
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  locale="ko"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek",
                  }}
                  buttonText={{
                    today: "오늘",
                    month: "월",
                    week: "주",
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  height="auto"
                  aspectRatio={1.6}
                  dayMaxEvents={3}
                  moreLinkText={(n) => `+${n}개`}
                  nowIndicator={true}
                  eventDisplay="block"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">상태 범례</p>
              <div className="space-y-2">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-muted-foreground">
                      {status === "TODO" ? "할 일" :
                       status === "IN_PROGRESS" ? "진행 중" :
                       status === "DONE" ? "완료" : "취소"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected date tasks */}
          {selectedDate && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">
                  {format(selectedDate, "M월 d일 (E)", { locale: ko })}
                </p>
                {selectedDateTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">
                    해당 날짜에 할 일이 없어요
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateTasks.map((task) => (
                      <button
                        key={task.id}
                        className="w-full text-left rounded-lg p-2.5 hover:bg-accent transition-colors border"
                        onClick={() => openDetailModal(task)}
                      >
                        <p className="text-xs font-medium line-clamp-1">{task.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {PRIORITY_CONFIG[task.priority].label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming tasks */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">마감 임박</p>
              {tasks
                .filter((t) =>
                  t.dueDate &&
                  t.status !== "DONE" &&
                  t.status !== "CANCELLED" &&
                  new Date(t.dueDate) >= new Date()
                )
                .sort((a, b) =>
                  new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
                )
                .slice(0, 5)
                .map((task) => (
                  <button
                    key={task.id}
                    className="w-full text-left rounded-lg p-2.5 hover:bg-accent transition-colors border mb-2 last:mb-0"
                    onClick={() => openDetailModal(task)}
                  >
                    <p className="text-xs font-medium line-clamp-1">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(task.dueDate!), "M월 d일", { locale: ko })}
                    </p>
                  </button>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateTaskModal />
      <TaskDetailModal />
    </DashboardLayout>
  );
}
