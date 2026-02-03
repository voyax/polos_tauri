// 婴儿头型测量系统 - Tauri 后端

use tauri_plugin_sql::{Migration, MigrationKind};

// 定义数据库迁移
fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
                -- 婴儿表
                CREATE TABLE IF NOT EXISTS infants (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
                    birth_date TEXT NOT NULL,
                    gestational_days INTEGER NOT NULL,
                    phone TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(phone, name)
                );
                
                -- 测量记录表
                CREATE TABLE IF NOT EXISTS measurements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    infant_id INTEGER NOT NULL,
                    measure_date TEXT NOT NULL,
                    length REAL NOT NULL,
                    width REAL NOT NULL,
                    diagonal_a REAL NOT NULL,
                    diagonal_b REAL NOT NULL,
                    head_circumference REAL NOT NULL,
                    cr REAL NOT NULL,
                    diff REAL NOT NULL,
                    cvai REAL NOT NULL,
                    corrected_age_days INTEGER NOT NULL,
                    remark TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (infant_id) REFERENCES infants(id)
                );
                
                -- 医院配置表
                CREATE TABLE IF NOT EXISTS hospital_config (
                    id INTEGER PRIMARY KEY CHECK(id = 1),
                    hospital_name TEXT NOT NULL DEFAULT '',
                    logo_path TEXT,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
                
                -- 插入默认配置
                INSERT OR IGNORE INTO hospital_config (id, hospital_name) VALUES (1, '');
                
                -- 创建索引
                CREATE INDEX IF NOT EXISTS idx_infants_phone ON infants(phone);
                CREATE INDEX IF NOT EXISTS idx_infants_name ON infants(name);
                CREATE INDEX IF NOT EXISTS idx_measurements_infant_id ON measurements(infant_id);
                CREATE INDEX IF NOT EXISTS idx_measurements_measure_date ON measurements(measure_date);
            "#,
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:polos.db", get_migrations())
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
