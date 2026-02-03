// 头型指标计算器

import type { HeadIndices } from "@/types";

export interface HeadMeasurement {
  length: number;    // 头长 (mm)
  width: number;     // 头宽 (mm)
  diagonalA: number; // 斜径 A (mm)
  diagonalB: number; // 斜径 B (mm)
}

/**
 * 计算头型指标
 * @param measurement 原始测量数据
 * @returns 计算后的指标 (CR, Diff, CVAI)
 */
export function calculateHeadIndices(measurement: HeadMeasurement): HeadIndices {
  const { length, width, diagonalA, diagonalB } = measurement;
  
  // CR (头颅指数) = 头宽 / 头长
  const cr = width / length;
  
  // Diff (斜径差) = |斜径A - 斜径B|
  const diff = Math.abs(diagonalA - diagonalB);
  
  // CVAI = (max - min) / max × 100
  const maxDiagonal = Math.max(diagonalA, diagonalB);
  const minDiagonal = Math.min(diagonalA, diagonalB);
  const cvai = ((maxDiagonal - minDiagonal) / maxDiagonal) * 100;
  
  return {
    cr: Math.round(cr * 1000) / 1000,      // 保留3位小数
    diff: Math.round(diff * 10) / 10,       // 保留1位小数
    cvai: Math.round(cvai * 100) / 100,     // 保留2位小数
  };
}

/**
 * 格式化 CR 显示
 */
export function formatCR(cr: number): string {
  return cr.toFixed(3);
}

/**
 * 格式化 CVAI 显示
 */
export function formatCVAI(cvai: number): string {
  return `${cvai.toFixed(2)}%`;
}

/**
 * 格式化 Diff 显示
 */
export function formatDiff(diff: number): string {
  return `${diff.toFixed(1)}mm`;
}
