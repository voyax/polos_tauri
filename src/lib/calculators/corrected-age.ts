// 矫正月龄计算器

const FULL_TERM_DAYS = 280; // 40周 × 7天

/**
 * 计算矫正天龄
 * @param birthDate 出生日期
 * @param gestationalDays 孕期总天数
 * @param measureDate 测量日期
 * @returns 矫正天龄
 */
export function calculateCorrectedAgeDays(
  birthDate: Date,
  gestationalDays: number,
  measureDate: Date
): number {
  // 早产天数 = 足月天数 - 孕期总天数
  const pretermDays = Math.max(0, FULL_TERM_DAYS - gestationalDays);
  
  // 实际天龄 = 测量日期 - 出生日期
  const actualAgeDays = Math.floor(
    (measureDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // 矫正天龄 = 实际天龄 - 早产天数
  const correctedAgeDays = actualAgeDays - pretermDays;
  
  return Math.max(0, correctedAgeDays);
}

/**
 * 将孕周+孕天转换为总天数
 * @param weeks 孕周
 * @param days 孕天
 * @returns 孕期总天数
 */
export function gestationalToTotalDays(weeks: number, days: number): number {
  return weeks * 7 + days;
}

/**
 * 将总天数转换为孕周+孕天
 * @param totalDays 孕期总天数
 * @returns { weeks, days }
 */
export function totalDaysToGestational(totalDays: number): { weeks: number; days: number } {
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
  };
}

/**
 * 格式化矫正月龄显示
 * @param days 矫正天龄
 * @returns 格式化字符串，如 "3月15天"
 */
export function formatCorrectedAge(days: number): string {
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  if (months === 0) {
    return `${remainingDays}天`;
  }
  if (remainingDays === 0) {
    return `${months}月`;
  }
  return `${months}月${remainingDays}天`;
}

/**
 * 格式化孕周显示
 * @param totalDays 孕期总天数
 * @returns 格式化字符串，如 "38+2周"
 */
export function formatGestationalAge(totalDays: number): string {
  const { weeks, days } = totalDaysToGestational(totalDays);
  if (days === 0) {
    return `${weeks}周`;
  }
  return `${weeks}+${days}周`;
}
