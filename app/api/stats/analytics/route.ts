import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  startOfDay, endOfDay, subDays, format, startOfWeek,
  differenceInDays, subWeeks,
} from "date-fns";
import { ko } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date();

  const [
    totalTasks,
    completedTasks,
    categories,
    priorityCounts,
    allCompletedTasks,
  ] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: "DONE" } }),
    prisma.category.findMany({
      where: { userId },
      include: { _count: { select: { tasks: true } } },
    }),
    prisma.$queryRaw<{ priority: string; count: bigint }[]>`
      SELECT priority, COUNT(*) as count
      FROM tasks
      WHERE "userId" = ${userId}
      GROUP BY priority
    `,
    prisma.task.findMany({
      where: { userId, status: "DONE", completedAt: { not: null } },
      select: { createdAt: true, completedAt: true },
    }),
  ]);

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Weekly productivity (last 8 weeks)
  const weeklyProductivity = await Promise.all(
    Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(today, 7 - i), { weekStartsOn: 1 });
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      return Promise.all([
        prisma.task.count({
          where: {
            userId,
            status: "DONE",
            completedAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        prisma.task.count({
          where: {
            userId,
            createdAt: { lte: weekEnd },
            status: { not: "CANCELLED" },
          },
        }),
      ]).then(([completed, total]) => ({
        week: format(weekStart, "M/d", { locale: ko }),
        completed,
        total,
      }));
    })
  );

  // Category distribution (only categories with tasks)
  const categoryDistribution = categories
    .filter((c) => c._count.tasks > 0)
    .map((c, i) => ({
      name: c.name,
      value: c._count.tasks,
      color: c.color,
    }));

  // Add "미분류" if there are tasks without category
  const uncategorizedCount = await prisma.task.count({
    where: { userId, categoryId: null },
  });
  if (uncategorizedCount > 0) {
    categoryDistribution.push({
      name: "미분류",
      value: uncategorizedCount,
      color: "#9CA3AF",
    });
  }

  // Priority distribution
  const priorityOrder = ["URGENT", "HIGH", "MEDIUM", "LOW"];
  const priorityMap = new Map(
    priorityCounts.map((p) => [p.priority, Number(p.count)])
  );
  const priorityDistribution = priorityOrder.map((priority) => ({
    priority: priority as any,
    count: priorityMap.get(priority) ?? 0,
  }));

  // Daily activity (last 30 days)
  const dailyActivity = await Promise.all(
    Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, 29 - i);
      return Promise.all([
        prisma.task.count({
          where: {
            userId,
            createdAt: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        }),
        prisma.task.count({
          where: {
            userId,
            status: "DONE",
            completedAt: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        }),
      ]).then(([created, completed]) => ({
        date: format(date, "M/d"),
        created,
        completed,
      }));
    })
  );

  // Streak days calculation
  let streakDays = 0;
  for (let i = 0; i < 365; i++) {
    const date = subDays(today, i);
    const count = await prisma.task.count({
      where: {
        userId,
        status: "DONE",
        completedAt: { gte: startOfDay(date), lte: endOfDay(date) },
      },
    });
    if (count > 0) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }

  // Average completion time (days from creation to completion)
  const avgCompletionTime =
    allCompletedTasks.length > 0
      ? Math.round(
          allCompletedTasks.reduce((sum, t) => {
            const days = differenceInDays(
              new Date(t.completedAt!),
              new Date(t.createdAt)
            );
            return sum + Math.max(0, days);
          }, 0) / allCompletedTasks.length
        )
      : 0;

  return NextResponse.json({
    completionRate,
    totalCompleted: completedTasks,
    streakDays,
    avgCompletionTime,
    weeklyProductivity,
    categoryDistribution,
    priorityDistribution,
    dailyActivity,
  });
}
