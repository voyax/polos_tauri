// 测量记录类型定义

export interface Measurement {
  id: number;
  infantId: number;
  measureDate: string; // ISO date string
  
  // 原始测量值
  length: number;      // 头长 (mm)
  width: number;       // 头宽 (mm)
  diagonalA: number;   // 斜径 A (mm)
  diagonalB: number;   // 斜径 B (mm)
  headCircumference: number; // 头围 (cm)
  
  // 计算值
  cr: number;          // 头颅指数
  diff: number;        // 斜径差 (mm)
  cvai: number;        // 顶颅不对称指数 (%)
  correctedAgeDays: number; // 矫正天龄
  
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementFormData {
  measureDate: string;
  length: number;
  width: number;
  diagonalA: number;
  diagonalB: number;
  headCircumference: number;
  remark?: string;
}

// 带婴儿信息的测量记录（用于列表展示）
export interface MeasurementWithInfant extends Measurement {
  infantName: string;
  infantPhone: string;
}

// 头型指标
export interface HeadIndices {
  cr: number;
  diff: number;
  cvai: number;
}

// 分级结果
export type GradeLevel = 1 | 2 | 3 | 4 | 5;
export type GradeName = "正常" | "轻度" | "中度" | "重度" | "极重度";

export interface GradeResult {
  level: GradeLevel;
  name: GradeName;
  color: string;
}

export interface MeasurementGrades {
  cr: GradeResult;
  cvai: GradeResult;
  diff: GradeResult;
}
