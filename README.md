# 在线音乐制作与分享平台

## 项目说明
本仓库包含前后端两个子项目：
- `server`：Koa + Sequelize 的后端服务
- `v3`：Vue 3 + Vite 的前端应用

## 目录结构
```text
.
├─server/        # 后端
│  ├─db/         # SQL 脚本
│  └─src/        # 业务代码
└─v3/            # 前端
   ├─src/        # 页面与组件
   └─public/     # 静态资源
```

## 环境要求
- Node.js 18+
- MySQL 8+

## 快速启动
1. 初始化数据库
   - 导入 `server/db/online_music.sql`
2. 配置后端环境变量
   - 编辑 `server/.env`
3. 安装依赖
   - 后端：`cd server && npm install`
   - 前端：`cd ../v3 && npm install`
4. 启动服务
   - 后端：`cd server && npm run serve`
   - 前端：`cd v3 && npm run serve`
5. 按你本地环境变量访问对应地址

## 后端环境变量（server/.env）
必填（示例，占位符）：
```env
APP_PORT=<YOUR_BACKEND_PORT>
MYSQL_HOST=<YOUR_DB_HOST>
MYSQL_PORT=<YOUR_DB_PORT>
MYSQL_USER=<YOUR_DB_USER>
MYSQL_PASSWORD=<YOUR_DB_PASSWORD>
MYSQL_DB=<YOUR_DB_NAME>
ADMIN_PASSWORD=<YOUR_ADMIN_PASSWORD>
BASEURL=<YOUR_BASE_URL>
JWT_SECRET=<YOUR_JWT_SECRET>
```

可选：
- `DEFAULT_USER_AVATAR`：新用户默认头像 URL
- `ARTICLE_COVER_OLD_PREFIX`：文章封面旧前缀（批量替换时使用）
- `ARTICLE_COVER_NEW_PREFIX`：文章封面新前缀（批量替换时使用）

## 前端可选环境变量（v3/.env.*）
```env
VITE_PROXY_BLOG_IMAGES=<YOUR_BLOG_IMAGE_PROXY>
VITE_PROXY_MUSIC_API=<YOUR_MUSIC_PROXY>
VITE_WS_URL=<YOUR_WS_URL>
VITE_ADMIN_URL=<YOUR_ADMIN_URL>
VITE_SITE_URL=<YOUR_SITE_URL>
VITE_CONTACT_QQ=
VITE_LINK_APPLY_TEXT=欢迎提交友链申请
VITE_DEFAULT_SITE_AVATAR=
VITE_COLA_UID=
VITE_COLA_APP_KEY=
```

## 构建
- 前端构建：`cd v3 && npm run build`
- 前端预览：`cd v3 && npm run preview`
- 后端生产启动：`cd server && npm run prd`
