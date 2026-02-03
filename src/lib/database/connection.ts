// 数据库连接管理

import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

/**
 * 获取数据库实例
 * 单例模式，确保只有一个数据库连接
 */
export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:polos.db");
  }
  return db;
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

/**
 * 执行事务
 */
export async function transaction<T>(
  callback: (db: Database) => Promise<T>
): Promise<T> {
  const database = await getDatabase();
  
  try {
    await database.execute("BEGIN TRANSACTION");
    const result = await callback(database);
    await database.execute("COMMIT");
    return result;
  } catch (error) {
    await database.execute("ROLLBACK");
    throw error;
  }
}
