import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(50),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  userType: z.enum(["WORKER", "STUDENT", "JOB_SEEKER", "OTHER"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, userType } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, ...(userType && { userType }) },
      select: { id: true, email: true, name: true },
    });

    // Create default categories
    await prisma.category.createMany({
      data: [
        { name: "업무", color: "#4D0E91", icon: "briefcase", userId: user.id },
        { name: "공부", color: "#2563EB", icon: "book", userId: user.id },
        { name: "개인", color: "#059669", icon: "home", userId: user.id },
      ],
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "회원가입에 실패했습니다" },
      { status: 500 }
    );
  }
}
