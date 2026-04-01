"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, GraduationCap, Search, MoreHorizontal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const USER_TYPES = [
  { value: "WORKER", label: "직장인", icon: Briefcase, desc: "출퇴근 및 업무 관리" },
  { value: "STUDENT", label: "학생", icon: GraduationCap, desc: "공부 시간 및 과제 관리" },
  { value: "JOB_SEEKER", label: "취준생", icon: Search, desc: "취업 준비 일정 관리" },
  { value: "OTHER", label: "기타", icon: MoreHorizontal, desc: "자유롭게 활용" },
];

export function UserTypeModal() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (userType: string) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const open = !isLoading && profile && !profile.userType;

  return (
    <Dialog open={!!open}>
      <DialogContent className="sm:max-w-md" hideClose>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-paperlogy text-2xl font-bold mb-1">어떤 유형으로 사용하시나요?</h2>
          <p className="text-sm text-muted-foreground">
            유형에 맞게 Taskmate를 최적화해 드릴게요
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {USER_TYPES.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all ${
                selected === value
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                  : "border-border hover:border-brand-300 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${selected === value ? "text-brand-600" : "text-muted-foreground"}`} />
                <span className={`font-medium ${selected === value ? "text-brand-600" : ""}`}>
                  {label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>

        <Button
          className="w-full"
          disabled={!selected}
          loading={mutation.isPending}
          onClick={() => mutation.mutate(selected)}
        >
          시작하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
