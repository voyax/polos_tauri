// 婴儿数据访问层

import { getDatabase } from "./connection";
import type { Infant, InfantSearchResult } from "@/types";

// 数据库返回的原始格式
interface InfantRow {
  id: number;
  name: string;
  gender: string;
  birth_date: string;
  gestational_days: number;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface InfantSearchRow extends InfantRow {
  last_measure_date: string | null;
  measurement_count: number;
}

// 转换为前端格式
function rowToInfant(row: InfantRow): Infant {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender as "male" | "female",
    birthDate: row.birth_date,
    gestationalDays: row.gestational_days,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToSearchResult(row: InfantSearchRow): InfantSearchResult {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender as "male" | "female",
    birthDate: row.birth_date,
    phone: row.phone,
    lastMeasureDate: row.last_measure_date ?? undefined,
    measurementCount: row.measurement_count,
  };
}

/**
 * 创建新婴儿
 */
export async function createInfant(data: {
  name: string;
  gender: string;
  birthDate: string;
  gestationalDays: number;
  phone: string;
}): Promise<number> {
  const db = await getDatabase();
  
  const result = await db.execute(
    `INSERT INTO infants (name, gender, birth_date, gestational_days, phone)
     VALUES ($1, $2, $3, $4, $5)`,
    [data.name, data.gender, data.birthDate, data.gestationalDays, data.phone]
  );
  
  return result.lastInsertId as number;
}

/**
 * 根据 ID 获取婴儿
 */
export async function getInfantById(id: number): Promise<Infant | null> {
  const db = await getDatabase();
  
  const rows = await db.select<InfantRow[]>(
    `SELECT * FROM infants WHERE id = $1`,
    [id]
  );
  
  return rows.length > 0 ? rowToInfant(rows[0]) : null;
}

/**
 * 搜索婴儿（支持手机号和姓名模糊匹配）
 */
export async function searchInfants(keyword: string): Promise<InfantSearchResult[]> {
  const db = await getDatabase();
  
  const searchPattern = `%${keyword}%`;
  
  const rows = await db.select<InfantSearchRow[]>(
    `SELECT 
      i.*,
      MAX(m.measure_date) as last_measure_date,
      COUNT(m.id) as measurement_count
     FROM infants i
     LEFT JOIN measurements m ON i.id = m.infant_id
     WHERE i.name LIKE $1 OR i.phone LIKE $1
     GROUP BY i.id
     ORDER BY i.updated_at DESC
     LIMIT 50`,
    [searchPattern]
  );
  
  return rows.map(rowToSearchResult);
}

/**
 * 获取婴儿列表
 */
export async function getInfants(limit = 50, offset = 0): Promise<InfantSearchResult[]> {
  const db = await getDatabase();
  
  const rows = await db.select<InfantSearchRow[]>(
    `SELECT 
      i.*,
      MAX(m.measure_date) as last_measure_date,
      COUNT(m.id) as measurement_count
     FROM infants i
     LEFT JOIN measurements m ON i.id = m.infant_id
     GROUP BY i.id
     ORDER BY i.updated_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  return rows.map(rowToSearchResult);
}

/**
 * 更新婴儿信息
 */
export async function updateInfant(id: number, data: {
  name?: string;
  gender?: string;
  birthDate?: string;
  gestationalDays?: number;
  phone?: string;
}): Promise<void> {
  const db = await getDatabase();
  
  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;
  
  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.gender !== undefined) {
    updates.push(`gender = $${paramIndex++}`);
    values.push(data.gender);
  }
  if (data.birthDate !== undefined) {
    updates.push(`birth_date = $${paramIndex++}`);
    values.push(data.birthDate);
  }
  if (data.gestationalDays !== undefined) {
    updates.push(`gestational_days = $${paramIndex++}`);
    values.push(data.gestationalDays);
  }
  if (data.phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(data.phone);
  }
  
  if (updates.length === 0) return;
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  
  await db.execute(
    `UPDATE infants SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
}

/**
 * 删除婴儿
 */
export async function deleteInfant(id: number): Promise<void> {
  const db = await getDatabase();
  
  // 首先删除关联的测量记录
  await db.execute(`DELETE FROM measurements WHERE infant_id = $1`, [id]);
  // 然后删除婴儿
  await db.execute(`DELETE FROM infants WHERE id = $1`, [id]);
}

/**
 * 检查婴儿是否存在（通过手机号+姓名）
 */
export async function checkInfantExists(phone: string, name: string): Promise<number | null> {
  const db = await getDatabase();
  
  const rows = await db.select<{ id: number }[]>(
    `SELECT id FROM infants WHERE phone = $1 AND name = $2`,
    [phone, name]
  );
  
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * 获取婴儿总数
 */
export async function getInfantCount(): Promise<number> {
  const db = await getDatabase();
  
  const rows = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM infants`
  );
  
  return rows[0].count;
}
