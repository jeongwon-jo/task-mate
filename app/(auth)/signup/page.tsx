"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Mail, Lock, User, Github, Eye, EyeOff, Check, Briefcase, GraduationCap, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const USER_TYPES = [
  { value: "WORKER", label: "직장인", icon: Briefcase, desc: "출퇴근 및 업무 관리" },
  { value: "STUDENT", label: "학생", icon: GraduationCap, desc: "공부 시간 및 과제 관리" },
  { value: "JOB_SEEKER", label: "취준생", icon: Search, desc: "취업 준비 일정 관리" },
  { value: "OTHER", label: "기타", icon: MoreHorizontal, desc: "자유롭게 활용" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [userType, setUserType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const passwordChecks = [
    { label: "8자 이상", ok: form.password.length >= 8 },
    { label: "영문 포함", ok: /[a-zA-Z]/.test(form.password) },
    { label: "숫자 포함", ok: /[0-9]/.test(form.password) },
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "이름을 입력해주세요";
    if (!form.email.trim()) errs.email = "이메일을 입력해주세요";
    if (form.password.length < 8) errs.password = "비밀번호는 8자 이상이어야 합니다";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "비밀번호가 일치하지 않습니다";
    if (!userType) errs.userType = "유형을 선택해주세요";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, userType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "회원가입에 실패했습니다");
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/dashboard",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mb-6">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-paperlogy text-4xl font-bold text-white mb-4">Taskmate</h1>
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            오늘부터 시작하는<br />
            스마트한 업무 관리
          </p>

          <div className="mt-12 space-y-3 text-left max-w-xs mx-auto">
            {[
              "무료로 시작, 언제든 업그레이드",
              "소셜 로그인으로 간편 가입",
              "크로스 플랫폼 지원 (PC/모바일)",
              "안전한 데이터 암호화",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/90">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-paperlogy text-xl font-bold text-brand-600">Taskmate</span>
          </div>

          <div className="mb-8">
            <h2 className="font-paperlogy text-3xl font-bold text-foreground mb-2">
              계정 만들기
            </h2>
            <p className="text-muted-foreground">무료로 시작하세요</p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full gap-3"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google로 가입하기
            </Button>
            <Button
              variant="outline"
              className="w-full gap-3"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <Github className="h-5 w-5" />
              GitHub로 가입하기
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">또는</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">이름</label>
              <Input
                placeholder="홍길동"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                leftIcon={<User className="h-4 w-4" />}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">이메일</label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                leftIcon={<Mail className="h-4 w-4" />}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">비밀번호</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              {form.password && (
                <div className="flex gap-3 mt-2">
                  {passwordChecks.map(({ label, ok }) => (
                    <span
                      key={label}
                      className={`text-xs flex items-center gap-1 ${ok ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-green-500" : "bg-gray-300"}`} />
                      {label}
                    </span>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">비밀번호 확인</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 재입력"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                leftIcon={<Lock className="h-4 w-4" />}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* User Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">나는 어떤 유형인가요?</label>
              <div className="grid grid-cols-2 gap-2">
                {USER_TYPES.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUserType(value)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                      userType === value
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                        : "border-border hover:border-brand-300 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${userType === value ? "text-brand-600" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${userType === value ? "text-brand-600" : ""}`}>
                        {label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
              {errors.userType && <p className="text-xs text-red-500">{errors.userType}</p>}
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              회원가입
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
