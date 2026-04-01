import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  taskId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  const limit = parseInt(searchParams.get("limit") || "20");

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      ...(taskId && { taskId }),
    },
    include: {
      task: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createNoteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        content: data.content,
        taskId: data.taskId || undefined,
        userId: session.user.id,
      },
      include: { task: { select: { id: true, title: true } } },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
