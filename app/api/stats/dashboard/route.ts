import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  startOfDay, endOfDay, subDays, format, startOfWeek, addDays,
} from "date-fns";
import { ko } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const taskInclude = {
    category: true,
    tags: { include: { tag: true } },
    _count: { select: { notes: true } },
  } as const;

  const [
    todayTasks,
    inProgressTasks,
    completedTodayTasks,
    totalTasks,
    urgentTasks,
    recentNotes,
    allTasks,
  ] = await Promise.all([
    // Today's tasks (due today)
    prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: todayStart, lte: todayEnd },
        status: { not: "CANCELLED" },
      },
      include: taskInclude,
      orderBy: { priority: "desc" },
      take: 10,
    }),
    // In progress count
    prisma.task.count({
      where: { userId, status: "IN_PROGRESS" },
    }),
    // Completed today count
    prisma.task.count({
      where: {
        userId,
        status: "DONE",
        completedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    // Total non-cancelled tasks
    prisma.task.count({
      where: { userId, status: { not: "CANCELLED" } },
    }),
    // Urgent tasks
    prisma.task.findMany({
      where: {
        userId,
        priority: { in: ["URGENT", "HIGH"] },
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
      include: taskInclude,
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 5,
    }),
    // Recent notes
    prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { task: { select: { id: true, title: true } } },
    }),
    // All tasks for completion rate
    prisma.task.count({ where: { userId } }),
  ]);

  const completedTotal = await prisma.task.count({
    where: { userId, status: "DONE" },
  });

  const completionRate =
    allTasks > 0 ? Math.round((completedTotal / allTasks) * 100) : 0;

  // Weekly stats (last 7 days)
  const weeklyStats = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return Promise.all([
        prisma.task.count({
          where: {
            userId,
            status: "DONE",
            completedAt: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        }),
        prisma.task.count({
          where: {
            userId,
            createdAt: { lte: endOfDay(date) },
            status: { not: "CANCELLED" },
          },
        }),
      ]).then(([completed, total]) => ({
        date: format(date, "M/d", { locale: ko }),
        completed,
        total,
      }));
    })
  );

  return NextResponse.json({
    todayTasks,
    inProgress: inProgressTasks,
    completedToday: completedTodayTasks,
    totalTasks,
    completionRate,
    urgentTasks,
    recentNotes,
    weeklyStats,
  });
}
