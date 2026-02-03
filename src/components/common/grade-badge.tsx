import { cn } from "@/lib/utils";
import type { GradeResult } from "@/types";

interface GradeBadgeProps {
  grade: GradeResult;
  /** 可选：自定义显示内容，不提供则显示等级名称 */
  value?: string;
  className?: string;
}

// 分级颜色配置
const gradeColors: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-green-50", text: "text-green-700" },
  2: { bg: "bg-yellow-50", text: "text-yellow-700" },
  3: { bg: "bg-orange-50", text: "text-orange-700" },
  4: { bg: "bg-red-50", text: "text-red-700" },
  5: { bg: "bg-purple-50", text: "text-purple-700" },
};

export function GradeBadge({ grade, value, className }: GradeBadgeProps) {
  const colors = gradeColors[grade.level];
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
        colors.bg,
        colors.text,
        className
      )}
    >
      {value ?? grade.name}
    </span>
  );
}


