import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const existing = await prisma.attendance.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: startOfDay(today), lte: endOfDay(today) },
    },
  });

  if (!existing?.checkIn) {
    return NextResponse.json({ error: "Not checked in today" }, { status: 400 });
  }

  if (existing.checkOut) {
    return NextResponse.json({ error: "Already checked out today" }, { status: 400 });
  }

  const attendance = await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: today },
  });

  return NextResponse.json(attendance);
}
