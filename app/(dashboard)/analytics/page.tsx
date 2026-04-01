"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { TrendingUp, CheckCircle2, Flame, Target, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AnalyticsData } from "@/types";

async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/stats/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

const CHART_COLORS = [
  "#4D0E91", "#7C3AED", "#2563EB", "#0891B2",
  "#059669", "#65A30D", "#D97706", "#DC2626",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  const statCards = [
    {
      title: "전체 완료율",
      value: `${analytics?.completionRate ?? 0}%`,
      icon: TrendingUp,
      color: "text-brand-600",
      bg: "bg-pastel-purple",
    },
    {
      title: "총 완료 작업",
      value: analytics?.totalCompleted ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-pastel-green",
    },
    {
      title: "연속 달성일",
      value: `${analytics?.streakDays ?? 0}일`,
      icon: Flame,
      color: "text-orange-600",
      bg: "bg-pastel-orange",
    },
    {
      title: "평균 완료 소요",
      value: analytics?.avgCompletionTime
        ? `${analytics.avgCompletionTime}일`
        : "-",
      icon: Target,
      color: "text-blue-600",
      bg: "bg-pastel-blue",
    },
  ];

  return (
    <DashboardLayout title="통계">
      <div className="mb-6">
        <h2 className="font-paperlogy text-2xl font-bold">생산성 통계</h2>
        <p className="text-sm text-muted-foreground">나의 업무 패턴을 분석해보세요</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="font-paperlogy text-3xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="mb-6">
          <TabsTrigger value="weekly">주간 분석</TabsTrigger>
          <TabsTrigger value="category">카테고리</TabsTrigger>
          <TabsTrigger value="priority">우선순위</TabsTrigger>
          <TabsTrigger value="daily">일별 활동</TabsTrigger>
        </TabsList>

        {/* Weekly Tab */}
        <TabsContent value="weekly">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly productivity area chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">주간 생산성 트렌드</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] bg-muted animate-pulse rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.weeklyProductivity ?? []}>
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E0D0FF" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#E0D0FF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="completedGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4D0E91" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4D0E91" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(v) => v === "total" ? "전체" : "완료"}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="전체"
                        stroke="#D0B0FF"
                        strokeWidth={2}
                        fill="url(#totalGrad)"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="완료"
                        stroke="#4D0E91"
                        strokeWidth={2.5}
                        fill="url(#completedGrad2)"
                        dot={{ fill: "#4D0E91", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Radial completion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">완료율</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {isLoading ? (
                  <div className="h-[200px] w-full bg-muted animate-pulse rounded-xl" />
                ) : (
                  <div className="relative">
                    <ResponsiveContainer width={200} height={200}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        startAngle={90}
                        endAngle={-270}
                        data={[{
                          value: analytics?.completionRate ?? 0,
                          fill: "#4D0E91",
                        }]}
                      >
                        <RadialBar
                          dataKey="value"
                          cornerRadius={10}
                          background={{ fill: "hsl(var(--muted))" }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="font-paperlogy text-3xl font-bold text-brand-600">
                        {analytics?.completionRate ?? 0}%
                      </span>
                      <span className="text-xs text-muted-foreground">완료율</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Priority distribution bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">우선순위별 분포</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-muted animate-pulse rounded-xl" />
                ) : (
                  <div className="space-y-3">
                    {(analytics?.priorityDistribution ?? []).map(({ priority, count }) => {
                      const colors: Record<string, { bg: string; text: string; bar: string }> = {
                        URGENT: { bg: "bg-pastel-red", text: "text-red-700", bar: "#F87171" },
                        HIGH: { bg: "bg-pastel-orange", text: "text-orange-700", bar: "#FB923C" },
                        MEDIUM: { bg: "bg-pastel-yellow", text: "text-yellow-700", bar: "#FCD34D" },
                        LOW: { bg: "bg-pastel-blue", text: "text-blue-700", bar: "#93C5FD" },
                      };
                      const c = colors[priority];
                      const total = analytics?.priorityDistribution.reduce(
                        (sum, p) => sum + p.count, 0
                      ) ?? 1;
                      const pct = Math.round((count / total) * 100);
                      const labels: Record<string, string> = {
                        URGENT: "긴급", HIGH: "높음", MEDIUM: "보통", LOW: "낮음",
                      };
                      return (
                        <div key={priority}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={`font-medium ${c.text}`}>{labels[priority]}</span>
                            <span className="text-muted-foreground">{count}개 ({pct}%)</span>
                          </div>
                          <Progress
                            value={pct}
                            className="h-2"
                            indicatorClassName=""
                            style={{ "--bar-color": c.bar } as React.CSSProperties}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Category Tab */}
        <TabsContent value="category">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">카테고리별 작업 분포</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] bg-muted animate-pulse rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.categoryDistribution ?? []}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {(analytics?.categoryDistribution ?? []).map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                            opacity={0.85}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number, name: string) => [`${v}개`, name]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">카테고리 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.categoryDistribution ?? []).map((cat, i) => {
                    const total = analytics?.categoryDistribution.reduce(
                      (sum, c) => sum + c.value, 0
                    ) ?? 1;
                    const pct = Math.round((cat.value / total) * 100);
                    return (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="flex justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: cat.color || CHART_COLORS[i] }}
                            />
                            <span className="font-medium">{cat.name}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {cat.value}개 ({pct}%)
                          </span>
                        </div>
                        <Progress
                          value={pct}
                          className="h-1.5"
                          indicatorClassName=""
                        />
                      </motion.div>
                    );
                  })}
                  {(analytics?.categoryDistribution ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      카테고리 데이터가 없어요
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Priority Tab */}
        <TabsContent value="priority">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">우선순위별 작업 수</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] bg-muted animate-pulse rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={(analytics?.priorityDistribution ?? []).map((p) => ({
                      name: { URGENT: "긴급", HIGH: "높음", MEDIUM: "보통", LOW: "낮음" }[p.priority],
                      count: p.count,
                      fill: { URGENT: "#F87171", HIGH: "#FB923C", MEDIUM: "#FCD34D", LOW: "#93C5FD" }[p.priority],
                    }))}
                    margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v}개`, "작업 수"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {(analytics?.priorityDistribution ?? []).map((_, index) => (
                        <Cell
                          key={index}
                          fill={
                            ["#F87171", "#FB923C", "#FCD34D", "#93C5FD"][index % 4]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Activity Tab */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">일별 활동 (최근 30일)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] bg-muted animate-pulse rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics?.dailyActivity ?? []}
                    margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      interval={4}
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
                      formatter={(v: number, name: string) => [
                        `${v}개`,
                        name === "created" ? "생성" : "완료",
                      ]}
                    />
                    <Legend
                      formatter={(v) => v === "created" ? "생성" : "완료"}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar
                      dataKey="created"
                      name="생성"
                      fill="#C4B5FD"
                      radius={[3, 3, 0, 0]}
                      animationDuration={800}
                    />
                    <Bar
                      dataKey="completed"
                      name="완료"
                      fill="#4D0E91"
                      radius={[3, 3, 0, 0]}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
