// Dashboard 数据 Hooks

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getTodayMeasurementsWithInfant } from "@/lib/database";

// 查询键
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  todayRecords: (page: number) => [...dashboardKeys.all, "today", page] as const,
};

/**
 * 获取 Dashboard 统计数据
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 1000 * 30, // 30秒
    refetchInterval: 1000 * 60, // 每分钟自动刷新
  });
}

/**
 * 获取今日测量记录（分页）
 */
export function useTodayMeasurements(page: number, pageSize = 20) {
  return useQuery({
    queryKey: dashboardKeys.todayRecords(page),
    queryFn: () => getTodayMeasurementsWithInfant(pageSize, (page - 1) * pageSize),
    staleTime: 1000 * 30,
  });
}
