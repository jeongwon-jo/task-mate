import Link from "next/link";
import {
  CheckSquare, Calendar, BarChart3, Zap, Shield, ArrowRight,
  Star, Clock, Target, TrendingUp, Users, Sparkles,
  Briefcase, GraduationCap, Search, ChevronRight,
  ListTodo, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CheckSquare,
    title: "스마트 할 일 관리",
    desc: "우선순위, 마감일, 카테고리로 체계적으로 관리하세요",
    color: "bg-pastel-purple text-brand-600",
  },
  {
    icon: Calendar,
    title: "캘린더 뷰",
    desc: "월간·주간 캘린더로 일정을 한눈에 파악하세요",
    color: "bg-pastel-blue text-blue-600",
  },
  {
    icon: BarChart3,
    title: "생산성 통계",
    desc: "주간 완료율, 카테고리 분포를 시각적으로 확인하세요",
    color: "bg-pastel-green text-green-600",
  },
  {
    icon: Clock,
    title: "출퇴근 / 공부 기록",
    desc: "직장인은 출퇴근, 학생은 공부 시간을 자동으로 기록하세요",
    color: "bg-pastel-orange text-orange-600",
  },
  {
    icon: Target,
    title: "우선순위 추천",
    desc: "마감일과 중요도 기반으로 오늘의 핵심 업무를 파악하세요",
    color: "bg-pastel-red text-red-600",
  },
  {
    icon: Shield,
    title: "안전한 데이터",
    desc: "소셜 로그인과 보안 인증으로 데이터를 안전하게 보호하세요",
    color: "bg-pastel-teal text-teal-600",
  },
];

const stats = [
  { label: "완료된 작업", value: "10K+", icon: CheckSquare },
  { label: "활성 사용자", value: "500+", icon: Users },
  { label: "생산성 향상", value: "40%", icon: TrendingUp },
];

const userTypes = [
  {
    icon: Briefcase,
    type: "직장인",
    color: "bg-pastel-purple text-brand-600",
    border: "border-brand-200 dark:border-brand-800",
    features: ["출퇴근 기록 자동화", "업무 우선순위 관리", "주간 업무 리포트", "팀 일정 파악"],
  },
  {
    icon: GraduationCap,
    type: "학생",
    color: "bg-pastel-blue text-blue-600",
    border: "border-blue-200 dark:border-blue-800",
    features: ["공부 시간 측정", "과목별 할 일 분류", "시험·과제 마감 관리", "학습 통계 확인"],
  },
  {
    icon: Search,
    type: "취준생",
    color: "bg-pastel-green text-green-600",
    border: "border-green-200 dark:border-green-800",
    features: ["지원 일정 관리", "자소서·면접 준비 할 일", "일일 루틴 기록", "목표 달성률 추적"],
  },
];

const howItWorks = [
  {
    step: "01",
    title: "회원가입 후 유형 선택",
    desc: "직장인, 학생, 취준생 중 나에게 맞는 유형을 선택하면 최적화된 환경으로 시작합니다.",
    icon: Users,
  },
  {
    step: "02",
    title: "할 일 & 일정 등록",
    desc: "오늘 해야 할 일을 등록하고, 우선순위와 마감일을 설정하세요.",
    icon: ListTodo,
  },
  {
    step: "03",
    title: "시작 기록",
    desc: "출근 또는 공부 시작 버튼을 누르면 활동 시간이 자동으로 기록됩니다.",
    icon: Bell,
  },
  {
    step: "04",
    title: "통계로 성장 확인",
    desc: "주간·월간 통계로 나의 생산성 변화를 한눈에 확인하세요.",
    icon: TrendingUp,
  },
];

const testimonials = [
  {
    name: "이지원",
    role: "마케터 · 직장인",
    text: "매일 아침 출근 체크 후 오늘 할 일을 바로 확인하는 습관이 생겼어요. 업무 집중도가 눈에 띄게 올랐습니다.",
    avatar: "이",
  },
  {
    name: "박수현",
    role: "대학교 4학년 · 학생",
    text: "공부 시간 기록 기능 덕분에 하루에 얼마나 공부했는지 정확히 알게 됐어요. 과제 마감도 절대 안 놓쳐요!",
    avatar: "박",
  },
  {
    name: "김도현",
    role: "취업 준비 중 · 취준생",
    text: "지원 일정, 자소서 수정, 면접 준비까지 한 곳에서 관리하니까 놓치는 게 없어졌어요.",
    avatar: "김",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-paperlogy text-xl font-bold text-brand-600">Taskmate</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">시작하기</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 px-4 py-1.5 text-sm text-brand-700 dark:text-brand-300 mb-8">
            <Sparkles className="h-4 w-4" />
            직장인·학생·취준생 모두를 위한 생산성 앱
          </div>

          <h1 className="font-paperlogy text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            더 스마트하게
            <br />
            <span className="gradient-text">일하는 방법</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            할 일, 일정, 시간 기록을 한 곳에서 관리하고
            <br className="hidden sm:block" />
            나만의 루틴으로 생산성을 극대화하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8">
                무료로 시작하기
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                로그인
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 shadow-brand-lg overflow-hidden">
            <div className="bg-brand-600 px-6 py-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-white/30" />
              <div className="h-3 w-3 rounded-full bg-white/30" />
              <div className="h-3 w-3 rounded-full bg-white/30" />
              <span className="ml-3 font-paperlogy text-white/90 text-sm font-medium">Taskmate Dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "오늘 할 일", value: "8", color: "bg-pastel-blue text-blue-700" },
                { label: "진행 중", value: "3", color: "bg-pastel-orange text-orange-700" },
                { label: "완료", value: "12", color: "bg-pastel-green text-green-700" },
                { label: "완료율", value: "75%", color: "bg-pastel-purple text-brand-700" },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-4 ${item.color.split(" ")[0]}`}>
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className={`font-paperlogy text-2xl font-bold ${item.color.split(" ")[1]}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 space-y-2">
              {[
                { title: "디자인 시스템 구축", priority: "긴급", status: "진행 중" },
                { title: "API 연동 테스트", priority: "높음", status: "할 일" },
                { title: "주간 보고서 작성", priority: "보통", status: "완료" },
              ].map((task) => (
                <div key={task.title} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
                  <div className="h-4 w-4 rounded-full border-2 border-brand-400" />
                  <span className="flex-1 text-sm font-medium">{task.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pastel-orange text-orange-700">{task.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="font-paperlogy text-3xl sm:text-4xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-paperlogy text-4xl font-bold text-foreground mb-4">
              누구에게나 맞는 Taskmate
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              유형별로 최적화된 기능과 인터페이스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userTypes.map(({ icon: Icon, type, color, border, features }) => (
              <div key={type} className={`rounded-2xl border-2 bg-card p-6 ${border}`}>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-paperlogy text-xl font-bold mb-4">{type}</h3>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-4 w-4 text-brand-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-paperlogy text-4xl font-bold text-foreground mb-4">
              시작하는 방법
            </h2>
            <p className="text-lg text-muted-foreground">딱 4단계면 충분합니다</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative">
                <div className="rounded-2xl border bg-card p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-paperlogy text-3xl font-bold text-brand-200 dark:text-brand-900">{step}</span>
                    <div className="h-9 w-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-paperlogy text-4xl font-bold text-foreground mb-4">모든 기능을 한 곳에</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              복잡한 업무 관리를 단순하고 직관적으로 만들어드립니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group rounded-2xl border bg-card p-6 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-paperlogy text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-paperlogy text-4xl font-bold text-foreground mb-4">사용자 후기</h2>
            <p className="text-lg text-muted-foreground">실제 사용자들의 이야기를 들어보세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar }) => (
              <div key={name} className="rounded-2xl border bg-card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-700 dark:text-brand-300">{avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-brand p-12 shadow-brand-lg">
            <h2 className="font-paperlogy text-4xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
            <p className="text-white/80 text-lg mb-8">
              직장인, 학생, 취준생 누구든 무료로 시작할 수 있어요
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-brand-700 hover:bg-white/90 border-0 shadow-lg text-base px-8 gap-2"
              >
                무료로 시작하기
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-paperlogy font-bold text-brand-600">Taskmate</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Taskmate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
