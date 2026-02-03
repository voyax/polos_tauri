# Polos Desktop (Tauri)

婴儿头型数据记录与跟踪系统 - Tauri 版本

## 技术栈

- **框架**: Tauri 2.0
- **前端**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui 风格组件
- **状态管理**: Zustand
- **数据库**: tauri-plugin-sql (SQLite)
- **图表**: Recharts

## 开发

### 环境要求

- Node.js 18+
- Rust 1.70+
- npm 9+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run tauri dev
```

### 构建生产版本

```bash
npm run tauri build
```

## 项目结构

```
polos_tauri/
├── src/                      # 前端源码
│   ├── components/           # UI 组件
│   │   ├── ui/              # 基础 UI 组件
│   │   └── layout/          # 布局组件
│   ├── pages/               # 页面
│   │   ├── dashboard/       # 首页
│   │   ├── infant/          # 婴儿管理
│   │   ├── measurement/     # 测量录入
│   │   └── settings/        # 系统设置
│   ├── lib/                 # 工具库
│   │   ├── database/        # 数据库操作
│   │   ├── calculators/     # 指标计算
│   │   └── utils/           # 工具函数
│   └── types/               # TypeScript 类型
│
├── src-tauri/               # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs           # 插件配置和数据库迁移
│   ├── capabilities/        # 权限配置
│   ├── Cargo.toml
│   └── tauri.conf.json
│
└── docs/                    # 项目文档
```

## 功能模块

- ✅ Dashboard 工作台
- ✅ 婴儿档案管理
- ✅ 测量数据录入
- ✅ 系统设置

## 待开发功能

- [ ] 指标自动计算（实时显示）
- [ ] 数据库 CRUD 完整实现
- [ ] 趋势图表
- [ ] PDF 报告生成
- [ ] 打印功能

## 许可证

Private
