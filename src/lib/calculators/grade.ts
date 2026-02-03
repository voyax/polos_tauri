// 头型分级判定器
// 基于美国亚特兰大儿保协会标准

import type { GradeLevel, GradeName, GradeResult, MeasurementGrades } from "@/types";

// 分级颜色配置
const GRADE_COLORS: Record<GradeLevel, string> = {
  1: "#22c55e", // 绿色 - 正常
  2: "#eab308", // 黄色 - 轻度
  3: "#f97316", // 橙色 - 中度
  4: "#ef4444", // 红色 - 重度
  5: "#dc2626", // 深红 - 极重度
};

const GRADE_NAMES: Record<GradeLevel, GradeName> = {
  1: "正常",
  2: "轻度",
  3: "中度",
  4: "重度",
  5: "极重度",
};

/**
 * CR (头颅指数) 分级
 * 包含偏头和长头两个方向
 */
export function gradeCR(cr: number): GradeResult {
  let level: GradeLevel;
  
  // 偏头方向 (CR > 0.90)
  if (cr >= 0.76 && cr <= 0.90) {
    level = 1; // 正常
  } else if (cr > 0.90 && cr <= 0.94) {
    level = 2; // 轻度
  } else if (cr > 0.94 && cr <= 0.97) {
    level = 3; // 中度
  } else if (cr > 0.97 && cr <= 1.0) {
    level = 4; // 重度
  } else if (cr > 1.0) {
    level = 5; // 极重度
  }
  // 长头方向 (CR < 0.76)
  else if (cr < 0.76 && cr >= 0.70) {
    level = 2; // 长头轻度
  } else if (cr < 0.70 && cr >= 0.65) {
    level = 3; // 长头中度
  } else if (cr < 0.65 && cr >= 0.60) {
    level = 4; // 长头重度
  } else {
    level = 5; // 长头极重度
  }
  
  return {
    level,
    name: GRADE_NAMES[level],
    color: GRADE_COLORS[level],
  };
}

/**
 * CVAI (顶颅不对称指数) 分级
 * 单位: %
 */
export function gradeCVAI(cvai: number): GradeResult {
  let level: GradeLevel;
  
  if (cvai < 3.5) {
    level = 1; // 正常
  } else if (cvai >= 3.5 && cvai < 6.25) {
    level = 2; // 轻度
  } else if (cvai >= 6.25 && cvai < 8.75) {
    level = 3; // 中度
  } else if (cvai >= 8.75 && cvai < 11) {
    level = 4; // 重度
  } else {
    level = 5; // 极重度
  }
  
  return {
    level,
    name: GRADE_NAMES[level],
    color: GRADE_COLORS[level],
  };
}

/**
 * Diff (斜径差 / CVA) 分级
 * 单位: mm
 */
export function gradeDiff(diff: number): GradeResult {
  let level: GradeLevel;
  
  if (diff < 6) {
    level = 1; // 正常
  } else if (diff >= 6 && diff < 10) {
    level = 2; // 轻度
  } else if (diff >= 10 && diff < 15) {
    level = 3; // 中度
  } else if (diff >= 15 && diff < 20) {
    level = 4; // 重度
  } else {
    level = 5; // 极重度
  }
  
  return {
    level,
    name: GRADE_NAMES[level],
    color: GRADE_COLORS[level],
  };
}

/**
 * 获取所有指标的分级结果
 */
export function getAllGrades(cr: number, cvai: number, diff: number): MeasurementGrades {
  return {
    cr: gradeCR(cr),
    cvai: gradeCVAI(cvai),
    diff: gradeDiff(diff),
  };
}

/**
 * 获取所有指标的分级结果（别名）
 */
export function gradeAll(indices: { cr: number; cvai: number; diff: number }): MeasurementGrades {
  return getAllGrades(indices.cr, indices.cvai, indices.diff);
}

/**
 * 获取最严重的分级
 */
export function getWorstGrade(grades: MeasurementGrades): GradeResult {
  const allGrades = [grades.cr, grades.cvai, grades.diff];
  return allGrades.reduce((worst, current) => 
    current.level > worst.level ? current : worst
  );
}
