import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStart = startOfDay(today);

  const existing = await prisma.attendance.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: startOfDay(today), lte: endOfDay(today) },
    },
  });

  if (existing?.checkIn) {
    return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
  }

  const attendance = existing
    ? await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkIn: today },
      })
    : await prisma.attendance.create({
        data: {
          userId: session.user.id,
          date: todayStart,
          checkIn: today,
        },
      });

  return NextResponse.json(attendance);
}
