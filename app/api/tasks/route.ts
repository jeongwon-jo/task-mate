import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
});

const taskInclude = {
  category: true,
  tags: { include: { tag: true } },
  _count: { select: { notes: true } },
} satisfies Prisma.TaskInclude;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Prisma.TaskWhereInput = {
    userId: session.user.id,
    ...(status && { status: status as any }),
    ...(priority && { priority: priority as any }),
    ...(categoryId && { categoryId }),
    ...(search && {
      title: { contains: search, mode: "insensitive" as const },
    }),
  };

  const orderBy: Prisma.TaskOrderByWithRelationInput =
    sortBy === "priority"
      ? { priority: sortOrder as any }
      : sortBy === "dueDate"
      ? { dueDate: sortOrder as any }
      : sortBy === "title"
      ? { title: sortOrder as any }
      : { createdAt: sortOrder as any };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({ tasks, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        categoryId: data.categoryId || undefined,
        userId: session.user.id,
      },
      include: taskInclude,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
