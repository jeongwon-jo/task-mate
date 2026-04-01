"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInMinutes } from "date-fns";
import { Clock, LogIn, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayAttendance, useCheckIn, useCheckOut } from "@/hooks/useAttendance";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LABELS: Record<string, { title: string; checkIn: string; checkOut: string; duration: string; done: string; banner: string }> = {
  WORKER: {
    title: "근무 현황",
    checkIn: "출근",
    checkOut: "퇴근",
    duration: "근무 시간",
    done: "오늘 근무 완료",
    banner: "출근 체크를 해주세요!",
  },
  STUDENT: {
    title: "공부 현황",
    checkIn: "공부 시작",
    checkOut: "공부 끝",
    duration: "공부 시간",
    done: "오늘 공부 완료",
    banner: "공부 시작을 기록해 보세요!",
  },
  JOB_SEEKER: {
    title: "오늘 현황",
    checkIn: "시작하기",
    checkOut: "마치기",
    duration: "활동 시간",
    done: "오늘 일정 완료",
    banner: "오늘 활동을 시작해 보세요!",
  },
  OTHER: {
    title: "오늘 현황",
    checkIn: "시작하기",
    checkOut: "마치기",
    duration: "활동 시간",
    done: "오늘 완료",
    banner: "오늘 활동을 시작해 보세요!",
  },
};

const DEFAULT_LABELS = LABELS.WORKER;

export function AttendanceWidget() {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: attendance } = useTodayAttendance();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!session,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!session) return null;

  const labels = (profile?.userType && LABELS[profile.userType]) || DEFAULT_LABELS;

  const hasCheckedIn = !!attendance?.checkIn;
  const hasCheckedOut = !!attendance?.checkOut;

  const workDuration = hasCheckedIn && hasCheckedOut
    ? differenceInMinutes(new Date(attendance.checkOut!), new Date(attendance.checkIn!))
    : hasCheckedIn
    ? differenceInMinutes(currentTime, new Date(attendance.checkIn!))
    : null;

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return "--:--";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}시간 ${m}분`;
  };

  return (
    <>
      {/* PC: 우측하단 토글 위젯 */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <div
          className={cn(
            "bg-white dark:bg-gray-900 rounded-2xl shadow-brand border border-border transition-all duration-300 overflow-hidden",
            collapsed ? "w-14 h-14" : "w-72"
          )}
        >
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full h-full flex items-center justify-center text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors rounded-2xl"
            >
              <Clock className="h-6 w-6" />
            </button>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{labels.title}</p>
                    <p className="text-sm font-bold text-foreground">
                      {format(currentTime, "HH:mm:ss")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="rounded-lg p-1 hover:bg-accent transition-colors"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2">
                  <p className="text-xs text-muted-foreground mb-0.5">{labels.checkIn}</p>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {hasCheckedIn ? formatTime(new Date(attendance!.checkIn!)) : "--:--"}
                  </p>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-2">
                  <p className="text-xs text-muted-foreground mb-0.5">{labels.checkOut}</p>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    {hasCheckedOut ? formatTime(new Date(attendance!.checkOut!)) : "--:--"}
                  </p>
                </div>
              </div>

              {workDuration !== null && (
                <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-2 mb-3 text-center">
                  <p className="text-xs text-muted-foreground">{labels.duration}</p>
                  <p className="text-sm font-bold text-brand-700 dark:text-brand-300">
                    {formatDuration(workDuration)}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!hasCheckedIn ? (
                  <Button
                    className="flex-1 h-9 text-sm"
                    onClick={() => checkIn.mutate()}
                    loading={checkIn.isPending}
                  >
                    <LogIn className="h-4 w-4" />
                    {labels.checkIn}
                  </Button>
                ) : !hasCheckedOut ? (
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-sm border-orange-300 text-orange-600 hover:bg-orange-50"
                    onClick={() => checkOut.mutate()}
                    loading={checkOut.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    {labels.checkOut}
                  </Button>
                ) : (
                  <div className="flex-1 text-center py-2 text-sm text-green-600 font-medium">
                    {labels.done}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: 상단 알림 배너 (시작 안했을 때만) */}
      {!hasCheckedIn && (
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 px-4 pt-2">
          <div className="flex items-center gap-3 bg-brand-600 text-white rounded-xl px-4 py-3 shadow-brand-lg">
            <Clock className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium flex-1">{labels.banner}</p>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30 border-0 h-8 text-xs"
              onClick={() => checkIn.mutate()}
              loading={checkIn.isPending}
            >
              {labels.checkIn}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
