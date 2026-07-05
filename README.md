# Study Room Booking System

自习室预约管理系统，包含前后端完整实现。

## 项目结构

```
Study-room-booking-system/
├── backend/          # NestJS 后端 API 服务
│   ├── src/
│   │   ├── ai/              # AI 聊天模块
│   │   ├── auth/            # 认证授权模块
│   │   ├── reservations/    # 预约管理模块
│   │   ├── seats/           # 座位管理模块
│   │   ├── study-rooms/     # 自习室管理模块
│   │   └── users/           # 用户管理模块
│   └── ...
├── frontend/         # Vue 3 前端应用
│   ├── src/
│   │   ├── api/             # API 接口封装
│   │   ├── components/      # 公共组件
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # 状态管理
│   │   └── views/           # 页面视图
│   └── ...
└── README.md
```

## 技术栈

### 后端
- **框架**: NestJS
- **语言**: TypeScript
- **数据库**: MySQL
- **认证**: JWT + Passport

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router

## 快速开始

### 环境要求
- Node.js >= 18
- pnpm

### 后端启动

```bash
cd backend
pnpm install
cp .env.example .env
# 编辑 .env 填入数据库配置
pnpm run start:dev
```

### 前端启动

```bash
cd frontend
pnpm install
pnpm run dev
```

## 功能特性

- 🔐 用户认证与授权（JWT）
- 📅 自习室预约管理
- 💺 座位管理
- 🤖 AI 智能助手
- 📊 数据统计看板
