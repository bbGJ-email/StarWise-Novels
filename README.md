# 星智文学小说站 v3.0.0

一个功能完整的现代小说阅读平台，由星智计算团队开发。

## 项目特性

- 📚 完整的用户前台（首页、小说浏览、阅读器）
- ✍️ 作者后台（作品管理、章节编辑）
- 🔐 用户认证系统
- 🔍 章节审核流程（待审核、审核通过、审核驳回）
- 💬 评论系统（发布、回复、删除、举报）
- 📱 响应式设计
- 🎨 美观的UI界面
- 🐳 Docker一键部署支持

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Ant Design
- Zustand（状态管理）
- React Router v6
- Axios

### 后端
- Node.js + Express
- SQLite 数据库
- Prisma ORM
- JWT 认证
- bcryptjs（密码加密）

## 项目结构

```
星智文学/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── api/              # API 接口
│   │   ├── pages/            # 页面组件
│   │   ├── store/            # 状态管理
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
├── server/                    # 后端项目
│   ├── prisma/               # Prisma 配置
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── middleware/       # 中间件
│   │   ├── routes/           # 路由
│   │   ├── utils/            # 工具函数
│   │   └── index.js
│   ├── public/               # 静态资源
│   └── package.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

#### 后端
```bash
cd server
npm install
```

#### 前端
```bash
cd client
npm install
```

### 数据库初始化

在 `server` 目录下运行：

```bash
npx prisma generate
npx prisma db push
```

### 创建示例数据（可选）

运行以下命令创建测试数据：

```bash
npm run db:seed
```

测试账号：
- 管理员：admin@starwise.com / 123456
- 作者：author@starwise.com / 123456
- 普通用户：user@starwise.com / 123456

### 启动项目

#### 方式一：传统方式启动

##### 启动后端（端口 3001）
```bash
cd server
npm run dev
```

##### 启动前端（端口 3000）
```bash
cd client
npm run dev
```

#### 方式二：Docker 一键部署

##### 环境要求
- Docker
- Docker Compose

##### 一键启动

在项目根目录运行：

```bash
docker-compose up -d
```

##### 停止服务

```bash
docker-compose down
```

### 访问应用

打开浏览器访问：http://localhost:3000

## 主要功能

### 用户前台
- 🏠 首页（小说推荐、热门榜单）
- 🔍 小说搜索和分类浏览
- 📖 小说阅读器（支持多种主题）
- 📚 个人书架
- 👤 用户中心

### 作者后台
- 📝 作品管理（创建、编辑、删除）
- 📄 章节管理
- 📊 数据统计

### API 接口

#### 用户相关
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

#### 小说相关
- `GET /api/novels` - 获取小说列表
- `GET /api/novels/hot` - 获取热门小说
- `GET /api/novels/my` - 获取我的小说
- `GET /api/novels/:id` - 获取小说详情
- `POST /api/novels` - 创建小说
- `PUT /api/novels/:id` - 更新小说
- `POST /api/novels/:novelId/cover` - 上传小说封面

#### 章节相关
- `GET /api/chapters/novel/:novelId` - 获取小说章节
- `GET /api/chapters/:id` - 获取章节详情
- `POST /api/chapters/novel/:novelId` - 创建章节
- `PUT /api/chapters/:id` - 更新章节
- `DELETE /api/chapters/:id` - 删除章节

#### 书架相关
- `GET /api/bookshelf` - 获取我的书架
- `POST /api/bookshelf` - 添加到书架
- `DELETE /api/bookshelf/:id` - 从书架移除
- `PUT /api/bookshelf/:id/progress` - 更新阅读进度

#### 评论相关
- `GET /api/comments` - 获取评论列表
- `POST /api/comments` - 发布评论
- `POST /api/comments/reply` - 回复评论
- `DELETE /api/comments/:id` - 删除评论
- `POST /api/comments/report` - 举报评论
- `GET /api/comments/admin/pending` - 获取待审核评论（管理员）
- `PUT /api/comments/admin/review/:id` - 审核评论（管理员）
- `GET /api/comments/admin/reports` - 获取评论举报（管理员）
- `PUT /api/comments/admin/reports/:id` - 处理评论举报（管理员）

## 开发团队

星智计算

## 许可证

MIT
