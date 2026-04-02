import { PrismaClient, TaskStatus, Priority, UserType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 오늘 기준 날짜 헬퍼
function daysAgo(n: number): Date {
  const d = new Date("2026-04-02");
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date("2026-04-02");
  d.setDate(d.getDate() + n);
  return d;
}

function setTime(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding...");

  // ─────────────────────────────────────────
  // 기존 테스트 유저 삭제 후 재생성
  // ─────────────────────────────────────────
  await prisma.user.deleteMany({ where: { email: "test@taskmate.dev" } });

  const hashedPassword = await bcrypt.hash("test1234!", 12);

  const user = await prisma.user.create({
    data: {
      name: "김태스크",
      email: "test@taskmate.dev",
      password: hashedPassword,
      userType: UserType.WORKER,
      workStartTime: "09:00",
      workEndTime: "18:00",
    },
  });

  console.log(`✅ User created: ${user.email}`);

  // ─────────────────────────────────────────
  // 카테고리
  // ─────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "업무", color: "#C4B5FD", icon: "briefcase", userId: user.id } }),
    prisma.category.create({ data: { name: "공부", color: "#93C5FD", icon: "book", userId: user.id } }),
    prisma.category.create({ data: { name: "개인", color: "#6EE7B7", icon: "home", userId: user.id } }),
    prisma.category.create({ data: { name: "운동", color: "#FDE68A", icon: "activity", userId: user.id } }),
    prisma.category.create({ data: { name: "사이드 프로젝트", color: "#F9A8D4", icon: "code", userId: user.id } }),
  ]);

  const [업무, 공부, 개인, 운동, 사이드] = categories;
  console.log(`✅ ${categories.length} categories created`);

  // ─────────────────────────────────────────
  // 할 일 (지난 4주 + 이번주 + 앞으로)
  // ─────────────────────────────────────────
  const tasks = [
    // ── 4주 전 (완료 위주)
    { title: "분기 KPI 정리", status: TaskStatus.DONE, priority: Priority.HIGH, categoryId: 업무.id, dueDate: daysAgo(28), completedAt: daysAgo(27), createdAt: daysAgo(30) },
    { title: "TypeScript 기초 강의 수강", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 공부.id, dueDate: daysAgo(25), completedAt: daysAgo(26), createdAt: daysAgo(29) },
    { title: "헬스장 등록", status: TaskStatus.DONE, priority: Priority.LOW, categoryId: 운동.id, dueDate: daysAgo(26), completedAt: daysAgo(26), createdAt: daysAgo(28) },
    { title: "팀 주간 보고서 작성", status: TaskStatus.DONE, priority: Priority.HIGH, categoryId: 업무.id, dueDate: daysAgo(27), completedAt: daysAgo(27), createdAt: daysAgo(28) },
    { title: "독서 30분", status: TaskStatus.DONE, priority: Priority.LOW, categoryId: 개인.id, dueDate: daysAgo(27), completedAt: daysAgo(27), createdAt: daysAgo(28) },
    { title: "Next.js 공식 문서 읽기", status: TaskStatus.CANCELLED, priority: Priority.MEDIUM, categoryId: 공부.id, dueDate: daysAgo(26), createdAt: daysAgo(28) },

    // ── 3주 전
    { title: "디자인 시스템 컴포넌트 정리", status: TaskStatus.DONE, priority: Priority.HIGH, categoryId: 업무.id, dueDate: daysAgo(21), completedAt: daysAgo(21), createdAt: daysAgo(22) },
    { title: "알고리즘 문제 5개 풀기", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 공부.id, dueDate: daysAgo(20), completedAt: daysAgo(20), createdAt: daysAgo(22) },
    { title: "포트폴리오 사이트 기획", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 사이드.id, dueDate: daysAgo(19), completedAt: daysAgo(19), createdAt: daysAgo(22) },
    { title: "주 3회 러닝 계획 수립", status: TaskStatus.DONE, priority: Priority.LOW, categoryId: 운동.id, dueDate: daysAgo(21), completedAt: daysAgo(21), createdAt: daysAgo(22) },
    { title: "월세 이체", status: TaskStatus.DONE, priority: Priority.URGENT, categoryId: 개인.id, dueDate: daysAgo(20), completedAt: daysAgo(20), createdAt: daysAgo(21) },
    { title: "고객사 미팅 자료 준비", status: TaskStatus.DONE, priority: Priority.URGENT, categoryId: 업무.id, dueDate: daysAgo(18), completedAt: daysAgo(18), createdAt: daysAgo(20) },
    { title: "팀 워크샵 아이디어 수집", status: TaskStatus.CANCELLED, priority: Priority.LOW, categoryId: 업무.id, dueDate: daysAgo(18), createdAt: daysAgo(20) },

    // ── 2주 전
    { title: "API 문서 작성", status: TaskStatus.DONE, priority: Priority.HIGH, categoryId: 업무.id, dueDate: daysAgo(14), completedAt: daysAgo(14), createdAt: daysAgo(15) },
    { title: "React Query 심화 학습", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 공부.id, dueDate: daysAgo(13), completedAt: daysAgo(13), createdAt: daysAgo(15) },
    { title: "사이드 프로젝트 DB 설계", status: TaskStatus.DONE, priority: Priority.HIGH, categoryId: 사이드.id, dueDate: daysAgo(12), completedAt: daysAgo(11), createdAt: daysAgo(15) },
    { title: "건강검진 예약", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 개인.id, dueDate: daysAgo(14), completedAt: daysAgo(13), createdAt: daysAgo(15) },
    { title: "스쿼트 100개", status: TaskStatus.DONE, priority: Priority.LOW, categoryId: 운동.id, dueDate: daysAgo(13), completedAt: daysAgo(13), createdAt: daysAgo(14) },
    { title: "코드 리뷰 진행", status: TaskStatus.DONE, priority: Priority.HIGH, categoryId: 업무.id, dueDate: daysAgo(12), completedAt: daysAgo(12), createdAt: daysAgo(13) },
    { title: "뉴스레터 구독 정리", status: TaskStatus.CANCELLED, priority: Priority.LOW, categoryId: 개인.id, dueDate: daysAgo(11), createdAt: daysAgo(13) },

    // ── 1주 전
    { title: "스프린트 회고 미팅", status: TaskStatus.DONE, priority: Priority.HIGH, categoryId: 업무.id, dueDate: daysAgo(7), completedAt: daysAgo(7), createdAt: daysAgo(8) },
    { title: "Prisma 스키마 최적화", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 공부.id, dueDate: daysAgo(6), completedAt: daysAgo(6), createdAt: daysAgo(8) },
    { title: "주간 운동 3회 완료", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 운동.id, dueDate: daysAgo(5), completedAt: daysAgo(5), createdAt: daysAgo(8) },
    { title: "사이드 프로젝트 UI 구현", status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, categoryId: 사이드.id, dueDate: daysFromNow(3), createdAt: daysAgo(7) },
    { title: "팀 온보딩 문서 작성", status: TaskStatus.DONE, priority: Priority.MEDIUM, categoryId: 업무.id, dueDate: daysAgo(5), completedAt: daysAgo(5), createdAt: daysAgo(7) },
    { title: "독서 '아토믹 해빗' 완독", status: TaskStatus.DONE, priority: Priority.LOW, categoryId: 개인.id, dueDate: daysAgo(4), completedAt: daysAgo(4), createdAt: daysAgo(7) },

    // ── 이번 주 / 오늘
    { title: "Q2 로드맵 초안 작성", status: TaskStatus.IN_PROGRESS, priority: Priority.URGENT, categoryId: 업무.id, dueDate: daysFromNow(1), createdAt: daysAgo(2) },
    { title: "Next.js 15 마이그레이션 검토", status: TaskStatus.TODO, priority: Priority.HIGH, categoryId: 공부.id, dueDate: daysFromNow(5), createdAt: daysAgo(1) },
    { title: "운동 루틴 점검", status: TaskStatus.TODO, priority: Priority.LOW, categoryId: 운동.id, dueDate: daysFromNow(2), createdAt: daysAgo(1) },
    { title: "랜딩페이지 카피라이팅", status: TaskStatus.TODO, priority: Priority.MEDIUM, categoryId: 사이드.id, dueDate: daysFromNow(7), createdAt: daysAgo(1) },
    { title: "월간 지출 정산", status: TaskStatus.TODO, priority: Priority.MEDIUM, categoryId: 개인.id, dueDate: daysFromNow(3), createdAt: daysAgo(0) },
    { title: "버그 리포트 대응", status: TaskStatus.IN_PROGRESS, priority: Priority.URGENT, categoryId: 업무.id, dueDate: daysFromNow(0), createdAt: daysAgo(0) },
    { title: "TypeScript 제네릭 정리", status: TaskStatus.TODO, priority: Priority.MEDIUM, categoryId: 공부.id, dueDate: daysFromNow(6), createdAt: daysAgo(0) },
    { title: "주말 여행 계획", status: TaskStatus.TODO, priority: Priority.LOW, categoryId: 개인.id, dueDate: daysFromNow(4), createdAt: daysAgo(0) },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        title: task.title,
        status: task.status,
        priority: task.priority,
        categoryId: task.categoryId,
        userId: user.id,
        dueDate: task.dueDate,
        completedAt: task.completedAt ?? null,
        createdAt: task.createdAt,
      },
    });
  }

  console.log(`✅ ${tasks.length} tasks created`);

  // ─────────────────────────────────────────
  // 출퇴근 기록 (지난 4주 평일)
  // ─────────────────────────────────────────
  const attendanceData: { daysBack: number; checkInH: number; checkInM: number; checkOutH: number; checkOutM: number }[] = [
    // 4주 전 (월~금)
    { daysBack: 28, checkInH: 8, checkInM: 55, checkOutH: 18, checkOutM: 10 },
    { daysBack: 27, checkInH: 9, checkInM: 5, checkOutH: 18, checkOutM: 30 },
    { daysBack: 26, checkInH: 9, checkInM: 0, checkOutH: 19, checkOutM: 0 },
    { daysBack: 25, checkInH: 8, checkInM: 50, checkOutH: 18, checkOutM: 20 },
    { daysBack: 24, checkInH: 9, checkInM: 10, checkOutH: 17, checkOutM: 55 },
    // 3주 전
    { daysBack: 21, checkInH: 9, checkInM: 0, checkOutH: 18, checkOutM: 5 },
    { daysBack: 20, checkInH: 8, checkInM: 58, checkOutH: 18, checkOutM: 40 },
    { daysBack: 19, checkInH: 9, checkInM: 15, checkOutH: 20, checkOutM: 0 }, // 야근
    { daysBack: 18, checkInH: 9, checkInM: 3, checkOutH: 18, checkOutM: 15 },
    { daysBack: 17, checkInH: 8, checkInM: 45, checkOutH: 18, checkOutM: 0 },
    // 2주 전
    { daysBack: 14, checkInH: 9, checkInM: 0, checkOutH: 18, checkOutM: 30 },
    { daysBack: 13, checkInH: 9, checkInM: 20, checkOutH: 19, checkOutM: 30 }, // 야근
    { daysBack: 12, checkInH: 8, checkInM: 55, checkOutH: 18, checkOutM: 10 },
    { daysBack: 11, checkInH: 9, checkInM: 5, checkOutH: 18, checkOutM: 5 },
    { daysBack: 10, checkInH: 9, checkInM: 0, checkOutH: 17, checkOutM: 50 },
    // 1주 전
    { daysBack: 7, checkInH: 9, checkInM: 10, checkOutH: 18, checkOutM: 20 },
    { daysBack: 6, checkInH: 8, checkInM: 50, checkOutH: 18, checkOutM: 0 },
    { daysBack: 5, checkInH: 9, checkInM: 0, checkOutH: 21, checkOutM: 0 }, // 야근
    { daysBack: 4, checkInH: 9, checkInM: 5, checkOutH: 18, checkOutM: 15 },
    { daysBack: 3, checkInH: 9, checkInM: 0, checkOutH: 18, checkOutM: 5 },
    // 이번 주
    { daysBack: 2, checkInH: 9, checkInM: 0, checkOutH: 18, checkOutM: 30 },
    { daysBack: 1, checkInH: 8, checkInM: 55, checkOutH: 18, checkOutM: 10 },
    // 오늘 - 출근만
    { daysBack: 0, checkInH: 9, checkInM: 5, checkOutH: 0, checkOutM: 0 },
  ];

  for (const a of attendanceData) {
    const date = daysAgo(a.daysBack);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const isToday = a.daysBack === 0;

    await prisma.attendance.create({
      data: {
        userId: user.id,
        date: dateOnly,
        checkIn: setTime(date, a.checkInH, a.checkInM),
        checkOut: isToday ? null : setTime(date, a.checkOutH, a.checkOutM),
      },
    });
  }

  console.log(`✅ ${attendanceData.length} attendance records created`);

  // ─────────────────────────────────────────
  // 메모
  // ─────────────────────────────────────────
  const taskList = await prisma.task.findMany({ where: { userId: user.id }, take: 3 });

  await prisma.note.createMany({
    data: [
      { content: "Q2 목표: 신규 기능 3개 출시, 버그 0건 유지", userId: user.id, taskId: taskList[0]?.id },
      { content: "React 18의 concurrent mode 관련 레퍼런스 정리 필요", userId: user.id, taskId: taskList[1]?.id },
      { content: "주말에 카페에서 사이드 프로젝트 기획 마무리하기", userId: user.id },
      { content: "팀원 A - 코드 리뷰 피드백: 에러 핸들링 개선 필요", userId: user.id, taskId: taskList[2]?.id },
      { content: "읽을 책 목록: 린 스타트업, 제로 투 원, 인스파이어드", userId: user.id },
    ],
  });

  console.log("✅ Notes created");
  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("📧 Email   : test@taskmate.dev");
  console.log("🔑 Password: test1234!");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
