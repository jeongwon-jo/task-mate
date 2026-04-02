"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePushNotification } from "@/hooks/usePushNotification";

// 5분마다 서버에 알림 체크 요청
const CHECK_INTERVAL = 5 * 60 * 1000;

export function NotificationManager() {
  const { data: session } = useSession();
  const { subscription } = usePushNotification();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session || !subscription) return;

    const check = () => {
      fetch("/api/push/check", { method: "POST" }).catch(() => {});
    };

    // 마운트 시 1회 즉시 체크
    check();

    // 이후 5분 간격
    timerRef.current = setInterval(check, CHECK_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, subscription]);

  return null;
}
