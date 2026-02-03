// 医院配置数据访问层

import { getDatabase } from "./connection";
import type { HospitalConfig } from "@/types";

// 数据库返回的原始格式
interface HospitalConfigRow {
  id: number;
  hospital_name: string;
  logo_path: string | null;
  updated_at: string;
}

// 转换为前端格式
function rowToConfig(row: HospitalConfigRow): HospitalConfig {
  return {
    id: row.id,
    hospitalName: row.hospital_name,
    logoPath: row.logo_path ?? undefined,
    updatedAt: row.updated_at,
  };
}

/**
 * 获取医院配置
 */
export async function getHospitalConfig(): Promise<HospitalConfig> {
  const db = await getDatabase();
  
  const rows = await db.select<HospitalConfigRow[]>(
    `SELECT * FROM hospital_config WHERE id = 1`
  );
  
  if (rows.length === 0) {
    // 返回默认配置
    return {
      id: 1,
      hospitalName: "",
      updatedAt: new Date().toISOString(),
    };
  }
  
  return rowToConfig(rows[0]);
}

/**
 * 更新医院配置
 */
export async function updateHospitalConfig(data: {
  hospitalName?: string;
  logoPath?: string | null;
}): Promise<void> {
  const db = await getDatabase();
  
  const updates: string[] = [];
  const values: (string | null)[] = [];
  let paramIndex = 1;
  
  if (data.hospitalName !== undefined) {
    updates.push(`hospital_name = $${paramIndex++}`);
    values.push(data.hospitalName);
  }
  if (data.logoPath !== undefined) {
    updates.push(`logo_path = $${paramIndex++}`);
    values.push(data.logoPath);
  }
  
  if (updates.length === 0) return;
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  
  await db.execute(
    `UPDATE hospital_config SET ${updates.join(", ")} WHERE id = 1`,
    values
  );
}
