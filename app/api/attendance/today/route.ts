import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
    },
  });

  return NextResponse.json(attendance);
}
