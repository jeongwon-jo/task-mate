import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: object) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    );
  } catch (err: any) {
    // 구독이 만료된 경우 DB에서 삭제
    if (err.statusCode === 410) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
    }
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return NextResponse.json({ sent: 0 });

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { workStartTime: true, workEndTime: true, userType: true },
  });

  const sent: string[] = [];

  // ── 1. 마감 임박 할 일 (24시간 이내, 아직 완료 안됨)
  const urgentTasks = await prisma.task.findMany({
    where: {
      userId,
      status: { in: ["TODO", "IN_PROGRESS"] },
      dueDate: {
        gte: now,
        lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { dueDate: "asc" },
    take: 3,
  });

  for (const task of urgentTasks) {
    const dueDate = new Date(task.dueDate!);
    const hoursLeft = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    const body = hoursLeft === 0
      ? `"${task.title}" 마감이 1시간 이내입니다!`
      : `"${task.title}" 마감까지 약 ${hoursLeft}시간 남았습니다`;

    for (const sub of subscriptions) {
      await sendPush(sub, {
        title: "⏰ 마감 임박",
        body,
        tag: `deadline-${task.id}`,
        url: "/tasks",
        requireInteraction: true,
      });
    }
    sent.push(`deadline:${task.id}`);
  }

  // ── 2. 출근 리마인더
  if (profile?.workStartTime) {
    const [startH, startM] = profile.workStartTime.split(":").map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(startH, startM - 10, 0, 0); // 10분 전

    const isNearCheckIn =
      Math.abs(now.getTime() - reminderTime.getTime()) < 5 * 60 * 1000; // 5분 이내

    if (isNearCheckIn) {
      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          userId,
          date: new Date(now.toDateString()),
          checkIn: { not: null },
        },
      });

      if (!todayAttendance) {
        const isWorker = profile.userType === "WORKER";
        const label = isWorker ? "출근" : "공부 시작";

        for (const sub of subscriptions) {
          await sendPush(sub, {
            title: `🏢 ${label} 시간이에요`,
            body: `${profile.workStartTime} ${label} 체크를 잊지 마세요!`,
            tag: "checkin-reminder",
            url: "/dashboard",
          });
        }
        sent.push("checkin");
      }
    }
  }

  // ── 3. 퇴근 리마인더
  if (profile?.workEndTime) {
    const [endH, endM] = profile.workEndTime.split(":").map(Number);
    const endTime = new Date(now);
    endTime.setHours(endH, endM, 0, 0);

    const isNearCheckOut =
      Math.abs(now.getTime() - endTime.getTime()) < 5 * 60 * 1000;

    if (isNearCheckOut) {
      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          userId,
          date: new Date(now.toDateString()),
          checkIn: { not: null },
          checkOut: null,
        },
      });

      if (todayAttendance) {
        const isWorker = profile.userType === "WORKER";
        const label = isWorker ? "퇴근" : "공부 종료";

        for (const sub of subscriptions) {
          await sendPush(sub, {
            title: `🏠 ${label} 시간이에요`,
            body: `오늘도 수고하셨습니다! ${label} 체크를 잊지 마세요.`,
            tag: "checkout-reminder",
            url: "/dashboard",
          });
        }
        sent.push("checkout");
      }
    }
  }

  return NextResponse.json({ sent: sent.length, items: sent });
}
