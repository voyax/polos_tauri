export { cn } from "./cn";

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: "date" | "datetime" | "time" = "date"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  switch (format) {
    case "datetime":
      return d.toLocaleDateString("zh-CN", { 
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "time":
      return d.toLocaleTimeString("zh-CN", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    default:
      return d.toLocaleDateString("zh-CN", { 
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit" 
      });
  }
}

/**
 * 矫正天龄转月龄显示
 */
export function correctedDaysToMonths(days: number): string {
  if (days < 0) {
    return `${Math.abs(days)}天 (待产)`;
  }
  
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  if (months === 0) {
    return `${remainingDays}天`;
  }
  
  return `${months}月${remainingDays}天`;
}

/**
 * 格式化手机号（隐藏中间4位）
 */
export function formatPhone(phone: string, mask = true): string {
  if (!mask) return phone;
  if (phone.length >= 11) {
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
  }
  return phone;
}

/**
 * 孕周天数转显示格式
 */
export function gestationalToDisplay(totalDays: number): string {
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return days > 0 ? `${weeks}+${days}周` : `${weeks}周`;
}

/**
 * 计算月龄
 */
export function calculateAge(birthDate: string | Date, referenceDate = new Date()): { months: number; days: number } {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const ref = typeof referenceDate === "string" ? new Date(referenceDate) : referenceDate;
  
  let months = (ref.getFullYear() - birth.getFullYear()) * 12 + (ref.getMonth() - birth.getMonth());
  let days = ref.getDate() - birth.getDate();
  
  if (days < 0) {
    months--;
    const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  return { months, days };
}
