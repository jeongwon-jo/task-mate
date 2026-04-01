import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional().default("#4D0E91"),
  icon: z.string().optional().default("folder"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createCategorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        userId: session.user.id,
      },
      include: { _count: { select: { tasks: true } } },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
