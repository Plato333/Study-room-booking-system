# 虚拟仿真实训平台 - 后端服务

基于 NestJS 的后端 API 服务，为虚拟仿真实训平台提供用户认证、实训管理、AI 智能问答和报告批阅等能力。

## 技术栈

- **框架**: NestJS + TypeScript
- **数据库**: MySQL 8 + TypeORM
- **认证**: JWT（jsonwebtoken + passport-jwt）
- **密码加密**: bcrypt
- **大模型**: OpenAI 兼容接口（通义千问 / 文心一言 / DeepSeek 等）
- **包管理**: pnpm
- **运行环境**: Node.js ≥ 24

## 快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 复制环境变量模板，填入真实值
cp .env.example .env

# 3. 创建数据库（MySQL 中执行）
# CREATE DATABASE rainier_training;

# 4. 启动开发服务器（热重载）
pnpm run start:dev
```

服务运行在 `http://localhost:3000`。

## 环境变量

参考 `.env.example`：

| 变量 | 必填 | 说明 |
|------|------|------|
| `DB_HOST` | ✅ | 数据库地址 |
| `DB_PORT` | ✅ | 数据库端口，默认 3306 |
| `DB_USERNAME` | ✅ | 数据库用户名 |
| `DB_PASSWORD` | ✅ | 数据库密码 |
| `DB_DATABASE` | ✅ | 数据库名 |
| `JWT_SECRET` | ✅ | JWT 签名密钥，任意复杂字符串 |
| `AI_API_KEY` | ✅ | 大模型 API Key（从模型供应商获取） |
| `AI_BASE_URL` | ✅ | 大模型 API 地址（OpenAI 兼容格式） |
| `AI_MODEL` | 否 | 模型名称，默认 `qwen-plus` |
| `AI_PROVIDER` | 否 | 模型供应商标识，默认 `qwen` |
| `PORT` | 否 | 服务端口，默认 3000 |

## 目录结构

```
src/
├── users/              用户模块（注册、查询、CRUD）
├── auth/               认证授权（JWT 策略、角色守卫、@Roles 装饰器）
├── training-projects/  实训项目（创建、发布、状态流转）
├── training-tasks/     实训任务（分配、报告提交、AI 批阅、人工复核）
├── ai/                 AI 模块（配置读取、智能问答、报告批阅）
├── app.module.ts       根模块
└── main.ts             应用入口
```

每个业务模块内部结构一致：`dto/`（参数校验）+ `entities/`（数据库表） + `*.service.ts`（业务逻辑）+ `*.controller.ts`（路由）+ `*.module.ts`（模块注册）。

## 核心 API

| 接口 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/register` | POST | 公开 | 用户注册 |
| `/api/auth/login` | POST | 公开 | 用户登录，返回 JWT |
| `/api/auth/profile` | GET | 登录 | 获取当前用户信息 |
| `/api/users` | GET | 管理员 | 用户列表 |
| `/api/training-projects` | GET/POST | 教师/管理员 | 实训项目 CRUD |
| `/api/training-tasks` | GET | 教师/管理员 | 查看任务分配列表 |
| `/api/training-tasks/my` | GET | 学生 | 查看我的任务 |
| `/api/training-tasks/assign` | POST | 教师/管理员 | 批量分配任务 |
| `/api/training-tasks/:id/report` | POST | 学生 | 提交实训报告 |
| `/api/training-tasks/reports/:id/ai-review` | POST | 教师/管理员 | AI 批阅报告 |
| `/api/training-tasks/reports/:id/review-confirm` | PATCH | 教师/管理员 | 人工复核 |
| `/api/ai/chat` | POST | 登录 | AI 智能问答 |

## 模块版本

### Day 2 — 用户登录与权限体系

| Tag | 模块内容 |
|-----|----------|
| `v2.1` | 数据库搭建与用户表设计 |
| `v2.2` | 用户注册接口 |
| `v2.3` | JWT 登录接口 |
| `v2.7` | RBAC 角色权限 |
| `v2.8` | 用户管理 CRUD |

### Day 3 — 实训项目管理

| Tag | 模块内容 |
|-----|----------|
| `v3.1` | 实训项目表设计 |
| `v3.3` | 实训项目 CRUD 接口 |
| `v3.4` | 实训项目状态流转 |
| `v3.5` | 实训任务分配 |
| `v3.6` | 学生提交报告 + 教师查看提交 |

### Day 4 — AI 应用

| Tag | 模块内容 |
|-----|----------|
| `v4.1` | 大模型 API 配置接入 |
| `v4.2` | 智能问答接口封装 |
| `v4.4` | 报告智能批阅 |
| `v4.6` | 教师人工复核 |

> 注：`v2.4~v2.6`、`v3.2`、`v4.3`、`v4.5` 为纯前端模块，后端无对应 tag。
