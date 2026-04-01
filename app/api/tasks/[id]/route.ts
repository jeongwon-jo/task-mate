import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

const taskInclude = {
  category: true,
  tags: { include: { tag: true } },
  notes: { orderBy: { createdAt: "desc" as const }, take: 5 },
  _count: { select: { notes: true } },
};

async function verifyOwner(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });
  return task;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = await prisma.task.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: taskInclude,
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await verifyOwner(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateTaskSchema.parse(body);

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt ? new Date(data.completedAt) : null,
        }),
      },
      include: taskInclude,
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await verifyOwner(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
