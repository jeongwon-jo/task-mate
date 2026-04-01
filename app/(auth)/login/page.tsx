"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, Github, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
		<div className="min-h-screen flex">
			{/* Left panel */}
			<div className="hidden lg:flex flex-1 bg-gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
				<div className="relative z-10 text-center">
					<div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mb-6">
						<Zap className="h-8 w-8 text-white" />
					</div>
					<h1 className="font-paperlogy text-4xl font-bold text-white mb-4">
						Taskmate
					</h1>
					<p className="text-white/80 text-lg max-w-sm leading-relaxed">
						AI 기반 스마트 업무 관리로
						<br />
						생산성을 극대화하세요
					</p>

					{/* Decorative elements */}
					<div className="mt-12 grid grid-cols-2 gap-4 max-w-xs mx-auto">
						{[
							{ label: "오늘 할 일", value: "8", bg: "bg-white/10" },
							{ label: "완료율", value: "75%", bg: "bg-white/10" },
							{ label: "진행 중", value: "3", bg: "bg-white/10" },
							{ label: "연속 달성", value: "12일", bg: "bg-white/10" },
						].map((stat) => (
							<div
								key={stat.label}
								className={`${stat.bg} rounded-xl p-4 text-white`}
							>
								<p className="text-white/60 text-xs mb-1">{stat.label}</p>
								<p className="font-paperlogy text-xl font-bold">{stat.value}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Right panel - Login form */}
			<div className="flex-1 flex items-center justify-center p-4 sm:p-8">
				<div className="w-full max-w-md">
					{/* Mobile logo */}
					<div className="lg:hidden flex items-center gap-2 mb-8">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
							<Zap className="h-4 w-4 text-white" />
						</div>
						<span className="font-paperlogy text-xl font-bold text-brand-600">
							Taskmate
						</span>
					</div>

					<div className="mb-8">
						<h2 className="font-paperlogy text-3xl font-bold text-foreground mb-2">
							다시 오셨군요!
						</h2>
						<p className="text-muted-foreground">계정에 로그인하세요</p>
					</div>

					{/* Social Login */}
					<div className="space-y-3 mb-6">
						<Button
							variant="outline"
							className="w-full gap-3"
							onClick={() => handleSocialLogin("google")}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Google로 계속하기
						</Button>

						<Button
							variant="outline"
							className="w-full gap-3"
							onClick={() => handleSocialLogin("github")}
						>
							<Github className="h-5 w-5" />
							GitHub로 계속하기
						</Button>

						<Button
							variant="outline"
							className="w-full gap-3 bg-[#FEE500] hover:bg-[#FDD835] border-[#FEE500] hover:border-[#FDD835] text-[#191919]"
							onClick={() => handleSocialLogin("kakao")}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.617 5.08 4.09 6.53l-1.04 3.87a.3.3 0 0 0 .44.34l4.55-3.01A11.64 11.64 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z" />
							</svg>
							카카오로 계속하기
						</Button>
					</div>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-3 text-muted-foreground">
								또는
							</span>
						</div>
					</div>

					{/* Email form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
								{error}
							</div>
						)}

						<div className="space-y-1.5">
							<label className="text-sm font-medium">이메일</label>
							<Input
								type="email"
								placeholder="example@email.com"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								leftIcon={<Mail className="h-4 w-4" />}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-sm font-medium">비밀번호</label>
							<Input
								type={showPassword ? "text" : "password"}
								placeholder="비밀번호 입력"
								value={form.password}
								onChange={(e) => setForm({ ...form, password: e.target.value })}
								leftIcon={<Lock className="h-4 w-4" />}
								rightIcon={
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="hover:text-foreground"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								}
								required
							/>
						</div>

						<Button
							type="submit"
							size="lg"
							className="w-full"
							loading={loading}
						>
							로그인
						</Button>
					</form>

					<p className="mt-6 text-center text-sm text-muted-foreground">
						계정이 없으신가요?{" "}
						<Link
							href="/signup"
							className="text-brand-600 font-medium hover:underline"
						>
							회원가입
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
