import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      dueDate: { gte: new Date() },
      status: { notIn: ["DONE", "CANCELLED"] },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { notes: true } },
    },
  });

  return NextResponse.json({ tasks });
}
