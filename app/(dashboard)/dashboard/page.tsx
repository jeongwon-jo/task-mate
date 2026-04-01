"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  CheckSquare, Clock, TrendingUp, AlertCircle, Plus,
  FileText, ChevronRight, Flame,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/tasks/TaskCard";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { useTaskStore } from "@/store/taskStore";
import { formatRelative, formatDate } from "@/lib/utils";
import { DashboardStats } from "@/types";

async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch("/api/stats/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const { openCreateModal } = useTaskStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 60000,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침이에요";
    if (hour < 18) return "좋은 오후예요";
    return "수고하셨어요";
  };

  const today = format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko });

  const statCards = [
    {
      title: "오늘 할 일",
      value: stats?.todayTasks.length ?? 0,
      icon: CheckSquare,
      color: "text-blue-600",
      bg: "bg-pastel-blue",
      desc: "오늘 마감",
    },
    {
      title: "진행 중",
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-pastel-orange",
      desc: "작업 중인 항목",
    },
    {
      title: "완료",
      value: stats?.completedToday ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-pastel-green",
      desc: "오늘 완료",
    },
    {
      title: "완료율",
      value: `${stats?.completionRate ?? 0}%`,
      icon: Flame,
      color: "text-brand-600",
      bg: "bg-pastel-purple",
      desc: "전체 기준",
    },
  ];

  return (
    <DashboardLayout title="대시보드">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground mb-0.5">{today}</p>
          <h2 className="font-paperlogy text-2xl font-bold">
            {greeting()}, {session?.user?.name?.split(" ")[0]}님!
          </h2>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          할 일 추가
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={statCardVariants}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
                <p className="font-paperlogy text-3xl font-bold text-foreground">
                  {isLoading ? (
                    <span className="inline-block h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </p>
                <div className="mt-1">
                  <p className="text-sm font-medium text-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">주간 생산성</CardTitle>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                    자세히 보기 <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[180px] bg-muted animate-pulse rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={stats?.weeklyStats ?? []}>
                    <defs>
                      <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4D0E91" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4D0E91" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        value,
                        name === "completed" ? "완료" : "전체",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--border))"
                      strokeWidth={1.5}
                      fill="none"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#4D0E91"
                      strokeWidth={2}
                      fill="url(#completedGrad)"
                      dot={{ fill: "#4D0E91", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Today's tasks */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">오늘 할 일</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                    전체 보기 <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))
              ) : stats?.todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">오늘 마감인 할 일이 없어요</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={openCreateModal}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 추가하기
                  </Button>
                </div>
              ) : (
                stats?.todayTasks.slice(0, 5).map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Completion Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">전체 완료율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="font-paperlogy text-4xl font-bold text-brand-600">
                  {stats?.completionRate ?? 0}%
                </span>
              </div>
              <Progress
                value={stats?.completionRate ?? 0}
                className="h-3"
                indicatorClassName="bg-gradient-brand"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{stats?.completedToday ?? 0} 완료</span>
                <span>{stats?.totalTasks ?? 0} 전체</span>
              </div>
            </CardContent>
          </Card>

          {/* Urgent tasks */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <CardTitle className="text-base">긴급 작업</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              ) : stats?.urgentTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  긴급 작업이 없어요
                </p>
              ) : (
                stats?.urgentTasks.slice(0, 3).map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">최근 메모</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              ) : stats?.recentNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  메모가 없어요
                </p>
              ) : (
                stats?.recentNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-muted/50 p-3 space-y-1"
                  >
                    <p className="text-sm leading-relaxed line-clamp-2">{note.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(note.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateTaskModal />
      <TaskDetailModal />
    </DashboardLayout>
  );
}
