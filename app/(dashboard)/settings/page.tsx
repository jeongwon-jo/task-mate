"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User, Palette, Clock, Bell, Trash2, Plus, Edit2, Save, X,
  Briefcase, GraduationCap, Search, MoreHorizontal,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/types";

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function fetchProfile() {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

const USER_TYPES = [
  { value: "WORKER", label: "직장인", icon: Briefcase, desc: "출퇴근 및 업무 관리" },
  { value: "STUDENT", label: "학생", icon: GraduationCap, desc: "공부 시간 및 과제 관리" },
  { value: "JOB_SEEKER", label: "취준생", icon: Search, desc: "취업 준비 일정 관리" },
  { value: "OTHER", label: "기타", icon: MoreHorizontal, desc: "자유롭게 활용" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const [workStart, setWorkStart] = useState(profile?.workStartTime ?? "09:00");
  const [workEnd, setWorkEnd] = useState(profile?.workEndTime ?? "18:00");
  const [name, setName] = useState(session?.user?.name ?? "");
  const [userType, setUserType] = useState(profile?.userType ?? "");
  const [newCat, setNewCat] = useState({ name: "", color: CATEGORY_COLORS[0] });
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatColor, setEditCatColor] = useState("");
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [saveWorkLoading, setSaveWorkLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setWorkStart(profile.workStartTime);
      setWorkEnd(profile.workEndTime);
      if (profile.userType) setUserType(profile.userType);
    }
    if (session?.user?.name) setName(session.user.name);
  }, [profile, session]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCat({ name: "", color: CATEGORY_COLORS[0] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCat(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleSaveProfile = async () => {
    setSaveProfileLoading(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userType: userType || null }),
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } finally {
      setSaveProfileLoading(false);
    }
  };

  const handleSaveWork = async () => {
    setSaveWorkLoading(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workStartTime: workStart, workEndTime: workEnd }),
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } finally {
      setSaveWorkLoading(false);
    }
  };

  const themes = [
    { value: "light", label: "라이트", icon: "☀️" },
    { value: "dark", label: "다크", icon: "🌙" },
    { value: "system", label: "시스템", icon: "💻" },
  ];

  return (
    <DashboardLayout title="설정">
      <div className="mb-6">
        <h2 className="font-paperlogy text-2xl font-bold">설정</h2>
        <p className="text-sm text-muted-foreground">계정 및 앱 환경을 설정하세요</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-1.5" />
            프로필
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-1.5" />
            테마
          </TabsTrigger>
          <TabsTrigger value="work">
            <Clock className="h-4 w-4 mr-1.5" />
            근무 시간
          </TabsTrigger>
          <TabsTrigger value="categories">
            카테고리
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>이름과 프로필 이미지를 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session?.user?.image ?? ""} />
                  <AvatarFallback className="text-xl">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">이름</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">이메일</label>
                <Input
                  value={session?.user?.email ?? ""}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">사용자 유형</label>
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
              </div>

              <Button onClick={handleSaveProfile} loading={saveProfileLoading}>
                <Save className="h-4 w-4" />
                저장하기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>테마 설정</CardTitle>
              <CardDescription>앱의 색상 테마를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`
                      flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                      ${theme === t.value
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
                        : "border-border hover:border-brand-300"
                      }
                    `}
                  >
                    <span className="text-3xl">{t.icon}</span>
                    <span className={`text-sm font-medium ${theme === t.value ? "text-brand-700 dark:text-brand-300" : ""}`}>
                      {t.label}
                    </span>
                    {theme === t.value && (
                      <span className="text-[10px] text-brand-600 bg-brand-100 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">
                        선택됨
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <p className="text-sm font-medium mb-1">미리보기</p>
                <div className="flex gap-2">
                  {["bg-brand-600", "bg-pastel-blue", "bg-pastel-green", "bg-pastel-orange", "bg-pastel-red"].map((c) => (
                    <div key={c} className={`h-8 w-8 rounded-lg ${c}`} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work time Tab */}
        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>근무 시간 설정</CardTitle>
              <CardDescription>출퇴근 알림에 사용될 기본 근무 시간을 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">출근 시간</label>
                  <Input
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">퇴근 시간</label>
                  <Input
                    type="time"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4">
                <p className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-1">
                  근무 시간 정보
                </p>
                <p className="text-xs text-muted-foreground">
                  설정된 출근 시간이 가까워지면 출근 버튼을 눌러달라는 알림이 표시됩니다.
                  PC에서는 우측 하단 위젯에서, 모바일에서는 상단 알림 배너로 표시됩니다.
                </p>
              </div>

              <Button onClick={handleSaveWork} loading={saveWorkLoading}>
                <Save className="h-4 w-4" />
                저장하기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>카테고리 관리</CardTitle>
              <CardDescription>할 일을 분류할 카테고리를 만들고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add category */}
              <div className="space-y-3">
                <p className="text-sm font-medium">새 카테고리 추가</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="카테고리 이름"
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => createCategoryMutation.mutate(newCat)}
                    disabled={!newCat.name.trim()}
                    loading={createCategoryMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                    추가
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setNewCat({ ...newCat, color })}
                      className={`h-7 w-7 rounded-full transition-all ${
                        newCat.color === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Category list */}
              <div className="space-y-2">
                <p className="text-sm font-medium">카테고리 목록</p>
                {catLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    카테고리가 없어요. 추가해보세요!
                  </p>
                ) : (
                  categories.map((cat: { id: string; name: string; color: string; _count?: { tasks: number } }) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      {editingCat === cat.id ? (
                        <>
                          <input
                            className="h-6 w-6 rounded-full cursor-pointer"
                            type="color"
                            value={editCatColor}
                            onChange={(e) => setEditCatColor(e.target.value)}
                          />
                          <Input
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="flex-1 h-8 text-sm"
                          />
                          <Button
                            size="icon-sm"
                            onClick={() =>
                              updateCategoryMutation.mutate({
                                id: cat.id,
                                name: editCatName,
                                color: editCatColor,
                              })
                            }
                            loading={updateCategoryMutation.isPending}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setEditingCat(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span
                            className="h-4 w-4 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="flex-1 text-sm font-medium">{cat.name}</span>
                          {cat._count && (
                            <span className="text-xs text-muted-foreground">
                              {cat._count.tasks}개
                            </span>
                          )}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCat(cat.id);
                              setEditCatName(cat.name);
                              setEditCatColor(cat.color);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("카테고리를 삭제하시겠습니까?")) {
                                deleteCategoryMutation.mutate(cat.id);
                              }
                            }}
                            loading={deleteCategoryMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
