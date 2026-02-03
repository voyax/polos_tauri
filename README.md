# Polos Desktop

<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="Polos Logo">
</p>

<p align="center">
  <strong>婴儿头型数据记录与跟踪系统</strong>
</p>

<p align="center">
  基于 Tauri 的跨平台桌面应用，用于医院内部记录、跟踪与分析婴儿头型数据。
</p>

## ✨ 功能特性

- 📋 **婴儿档案管理** - 创建和管理婴儿基本信息档案
- 📏 **测量数据录入** - 记录颅长、颅宽、斜径、头围等测量数据
- 📊 **指标自动计算** - 实时计算 CI、CVAI、CVA 等头型指标
- 📈 **趋势分析图表** - 直观展示头型数据变化趋势
- 🏥 **医院配置** - 自定义医院名称和 Logo
- 🖨️ **报告生成** - 生成专业的检查报告单支持打印
- 💾 **本地数据存储** - SQLite 本地数据库，数据安全可靠

## 🛠️ 技术栈

- **框架**: [Tauri 2.0](https://tauri.app/) - 构建轻量、安全的桌面应用
- **前端**: React 18 + TypeScript + Vite
- **UI 组件**: Tailwind CSS + shadcn/ui 风格
- **图表**: Recharts
- **数据库**: SQLite (tauri-plugin-sql)
- **表单**: React Hook Form + Zod

## 📦 安装

### Windows

从 [Releases](https://github.com/voyax/polos_tauri/releases) 页面下载最新版本的安装包：
- `.msi` - Windows 安装包
- `.exe` - NSIS 安装程序

### macOS

```bash
# 克隆仓库
git clone https://github.com/voyax/polos_tauri.git
cd polos_tauri

# 安装依赖
npm install

# 构建应用
npm run tauri build
```

## 🚀 开发

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

## 📁 项目结构

```
polos_tauri/
├── src/                      # 前端源码
│   ├── components/           # UI 组件
│   │   ├── ui/              # 基础 UI 组件
│   │   ├── charts/          # 图表组件
│   │   ├── common/          # 通用组件
│   │   ├── layout/          # 布局组件
│   │   └── report/          # 报告组件
│   ├── pages/               # 页面
│   │   ├── dashboard/       # 首页工作台
│   │   ├── infant/          # 婴儿档案管理
│   │   ├── measurement/     # 测量数据录入
│   │   └── settings/        # 系统设置
│   ├── hooks/               # React Hooks
│   ├── lib/                 # 工具库
│   │   ├── database/        # 数据库操作
│   │   ├── calculators/     # 指标计算
│   │   ├── data/            # 静态数据
│   │   └── utils/           # 工具函数
│   └── types/               # TypeScript 类型定义
│
├── src-tauri/               # Tauri 后端 (Rust)
│   ├── src/                 # Rust 源码
│   ├── icons/               # 应用图标
│   ├── capabilities/        # 权限配置
│   └── tauri.conf.json      # Tauri 配置
│
└── .github/workflows/       # GitHub Actions
```

## 📸 截图

*待添加*

## 📄 许可证

Private © 2026 voya

## 📧 联系

- **作者**: voya
- **邮箱**: hi@melolib.com
