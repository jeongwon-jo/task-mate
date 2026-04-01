import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Attendance } from "@/types";

async function fetchTodayAttendance(): Promise<Attendance | null> {
  const res = await fetch("/api/attendance/today");
  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

async function checkIn(): Promise<Attendance> {
  const res = await fetch("/api/attendance/check-in", { method: "POST" });
  if (!res.ok) throw new Error("Failed to check in");
  return res.json();
}

async function checkOut(): Promise<Attendance> {
  const res = await fetch("/api/attendance/check-out", { method: "POST" });
  if (!res.ok) throw new Error("Failed to check out");
  return res.json();
}

export function useTodayAttendance() {
  return useQuery({
    queryKey: ["attendance", "today"],
    queryFn: fetchTodayAttendance,
    refetchInterval: 60000,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
