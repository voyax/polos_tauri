// Dashboard 统计数据服务

import { getDatabase } from "./connection";
import { 
  getTodayMeasurementCount, 
  getWeekMeasurementCount, 
  getAbnormalRatio 
} from "./measurement";
import { getInfantCount } from "./infant";
import type { MeasurementWithInfant } from "@/types";

export interface DashboardStats {
  todayMeasurements: number;
  weekMeasurements: number;
  totalInfants: number;
  abnormalRatio: number;
}

/**
 * 获取 Dashboard 统计数据
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [todayMeasurements, weekMeasurements, totalInfants, abnormalRatio] = 
    await Promise.all([
      getTodayMeasurementCount(),
      getWeekMeasurementCount(),
      getInfantCount(),
      getAbnormalRatio(),
    ]);
  
  return {
    todayMeasurements,
    weekMeasurements,
    totalInfants,
    abnormalRatio,
  };
}

/**
 * 获取今日测量记录（带婴儿信息）
 */
export async function getTodayMeasurementsWithInfant(
  limit = 20, 
  offset = 0
): Promise<{ data: MeasurementWithInfant[]; total: number }> {
  const db = await getDatabase();
  const today = new Date().toISOString().split("T")[0];
  
  // 获取总数
  const countRows = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM measurements WHERE date(measure_date) = $1`,
    [today]
  );
  const total = countRows[0].count;
  
  // 获取数据
  interface JoinedRow {
    id: number;
    infant_id: number;
    measure_date: string;
    length: number;
    width: number;
    diagonal_a: number;
    diagonal_b: number;
    head_circumference: number;
    cr: number;
    diff: number;
    cvai: number;
    corrected_age_days: number;
    remark: string | null;
    created_at: string;
    updated_at: string;
    infant_name: string;
    infant_phone: string;
  }
  
  const rows = await db.select<JoinedRow[]>(
    `SELECT m.*, i.name as infant_name, i.phone as infant_phone
     FROM measurements m
     INNER JOIN infants i ON m.infant_id = i.id
     WHERE date(m.measure_date) = $1
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [today, limit, offset]
  );
  
  const data: MeasurementWithInfant[] = rows.map(row => ({
    id: row.id,
    infantId: row.infant_id,
    measureDate: row.measure_date,
    length: row.length,
    width: row.width,
    diagonalA: row.diagonal_a,
    diagonalB: row.diagonal_b,
    headCircumference: row.head_circumference,
    cr: row.cr,
    diff: row.diff,
    cvai: row.cvai,
    correctedAgeDays: row.corrected_age_days,
    remark: row.remark ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    infantName: row.infant_name,
    infantPhone: row.infant_phone,
  }));
  
  return { data, total };
}

/**
 * 获取系统数据统计
 */
export async function getSystemStats(): Promise<{ 
  totalInfants: number; 
  totalMeasurements: number;
}> {
  const db = await getDatabase();
  
  const [infantRows, measurementRows] = await Promise.all([
    db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM infants"),
    db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM measurements"),
  ]);
  
  return {
    totalInfants: infantRows[0]?.count ?? 0,
    totalMeasurements: measurementRows[0]?.count ?? 0,
  };
}

