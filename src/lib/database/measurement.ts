// 测量记录数据访问层

import { getDatabase } from "./connection";
import type { Measurement } from "@/types";

// 数据库返回的原始格式
interface MeasurementRow {
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
}

// 转换为前端格式
function rowToMeasurement(row: MeasurementRow): Measurement {
  return {
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
  };
}

/**
 * 创建测量记录
 */
export async function createMeasurement(data: {
  infantId: number;
  measureDate: string;
  length: number;
  width: number;
  diagonalA: number;
  diagonalB: number;
  headCircumference: number;
  cr: number;
  diff: number;
  cvai: number;
  correctedAgeDays: number;
  remark?: string;
}): Promise<number> {
  const db = await getDatabase();
  
  const result = await db.execute(
    `INSERT INTO measurements (
      infant_id, measure_date, length, width, diagonal_a, diagonal_b,
      head_circumference, cr, diff, cvai, corrected_age_days, remark
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      data.infantId,
      data.measureDate,
      data.length,
      data.width,
      data.diagonalA,
      data.diagonalB,
      data.headCircumference,
      data.cr,
      data.diff,
      data.cvai,
      data.correctedAgeDays,
      data.remark ?? null,
    ]
  );
  
  return result.lastInsertId as number;
}

/**
 * 根据 ID 获取测量记录
 */
export async function getMeasurementById(id: number): Promise<Measurement | null> {
  const db = await getDatabase();
  
  const rows = await db.select<MeasurementRow[]>(
    `SELECT * FROM measurements WHERE id = $1`,
    [id]
  );
  
  return rows.length > 0 ? rowToMeasurement(rows[0]) : null;
}

/**
 * 获取婴儿的所有测量记录（按测量日期降序）
 */
export async function getMeasurementsByInfantId(infantId: number): Promise<Measurement[]> {
  const db = await getDatabase();
  
  const rows = await db.select<MeasurementRow[]>(
    `SELECT * FROM measurements 
     WHERE infant_id = $1 
     ORDER BY measure_date DESC, created_at DESC`,
    [infantId]
  );
  
  return rows.map(rowToMeasurement);
}

/**
 * 获取今日测量记录
 */
export async function getTodayMeasurements(): Promise<Measurement[]> {
  const db = await getDatabase();
  const today = new Date().toISOString().split("T")[0];
  
  const rows = await db.select<MeasurementRow[]>(
    `SELECT * FROM measurements 
     WHERE date(measure_date) = $1 
     ORDER BY created_at DESC`,
    [today]
  );
  
  return rows.map(rowToMeasurement);
}

/**
 * 更新测量记录
 */
export async function updateMeasurement(id: number, data: {
  measureDate?: string;
  length?: number;
  width?: number;
  diagonalA?: number;
  diagonalB?: number;
  headCircumference?: number;
  cr?: number;
  diff?: number;
  cvai?: number;
  correctedAgeDays?: number;
  remark?: string;
}): Promise<void> {
  const db = await getDatabase();
  
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;
  
  if (data.measureDate !== undefined) {
    updates.push(`measure_date = $${paramIndex++}`);
    values.push(data.measureDate);
  }
  if (data.length !== undefined) {
    updates.push(`length = $${paramIndex++}`);
    values.push(data.length);
  }
  if (data.width !== undefined) {
    updates.push(`width = $${paramIndex++}`);
    values.push(data.width);
  }
  if (data.diagonalA !== undefined) {
    updates.push(`diagonal_a = $${paramIndex++}`);
    values.push(data.diagonalA);
  }
  if (data.diagonalB !== undefined) {
    updates.push(`diagonal_b = $${paramIndex++}`);
    values.push(data.diagonalB);
  }
  if (data.headCircumference !== undefined) {
    updates.push(`head_circumference = $${paramIndex++}`);
    values.push(data.headCircumference);
  }
  if (data.cr !== undefined) {
    updates.push(`cr = $${paramIndex++}`);
    values.push(data.cr);
  }
  if (data.diff !== undefined) {
    updates.push(`diff = $${paramIndex++}`);
    values.push(data.diff);
  }
  if (data.cvai !== undefined) {
    updates.push(`cvai = $${paramIndex++}`);
    values.push(data.cvai);
  }
  if (data.correctedAgeDays !== undefined) {
    updates.push(`corrected_age_days = $${paramIndex++}`);
    values.push(data.correctedAgeDays);
  }
  if (data.remark !== undefined) {
    updates.push(`remark = $${paramIndex++}`);
    values.push(data.remark);
  }
  
  if (updates.length === 0) return;
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  
  await db.execute(
    `UPDATE measurements SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
}

/**
 * 删除测量记录
 */
export async function deleteMeasurement(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM measurements WHERE id = $1`, [id]);
}

/**
 * 统计查询：今日测量数
 */
export async function getTodayMeasurementCount(): Promise<number> {
  const db = await getDatabase();
  const today = new Date().toISOString().split("T")[0];
  
  const rows = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM measurements WHERE date(measure_date) = $1`,
    [today]
  );
  
  return rows[0].count;
}

/**
 * 统计查询：本周测量数
 */
export async function getWeekMeasurementCount(): Promise<number> {
  const db = await getDatabase();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekStart = monday.toISOString().split("T")[0];
  
  const rows = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM measurements WHERE date(measure_date) >= $1`,
    [weekStart]
  );
  
  return rows[0].count;
}

/**
 * 统计查询：异常比例（最近一次测量中 CR/CVAI/Diff 任一异常的婴儿占比）
 */
export async function getAbnormalRatio(): Promise<number> {
  const db = await getDatabase();
  
  // 获取每个婴儿的最新测量记录
  const rows = await db.select<{ is_abnormal: number }[]>(
    `SELECT 
      CASE 
        WHEN m.cr < 0.76 OR m.cr > 0.90 OR m.cvai >= 3.5 OR m.diff >= 6 
        THEN 1 ELSE 0 
      END as is_abnormal
     FROM measurements m
     INNER JOIN (
       SELECT infant_id, MAX(measure_date) as max_date
       FROM measurements
       GROUP BY infant_id
     ) latest ON m.infant_id = latest.infant_id AND m.measure_date = latest.max_date`
  );
  
  if (rows.length === 0) return 0;
  
  const abnormalCount = rows.filter(r => r.is_abnormal === 1).length;
  return abnormalCount / rows.length;
}
