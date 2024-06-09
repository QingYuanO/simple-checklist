### 1、部署
- Fork 此项目
- 登录cloudflare，打开Workers 和 Pages 选项，然后点击创建项目，选择 Pages并连接到 Fork的项目
<img width="1398" alt="image" src="https://github.com/QingYuanO/simple-checklist/assets/42159029/168bcc41-a999-4f4d-bcd3-7d2ba6254907">
<img width="1328" alt="image" src="https://github.com/QingYuanO/simple-checklist/assets/42159029/681becfb-5a60-4bf7-a8a3-99dc09f5fdc2">

- 设置 Admin：添加环境变量`ADMIN_ACCOUNT = "手机号"`，使用此手机号登录的用户将成为管理员
  <img width="1636" alt="image" src="https://github.com/QingYuanO/simple-checklist/assets/42159029/3944c455-5823-4119-88d7-4a5df46d4a9d">
  
- 创建 D1：打开项目，下载依赖后，执行 `npx wrangler d1 create simple-checklist`，`npx wrangler d1 migrations apply simple-checklist --remote`
- 连接 D1：将上一步创建的 D1 连接到你的项目
<img width="1652" alt="image" src="https://github.com/QingYuanO/simple-checklist/assets/42159029/5674109a-acb0-4ab5-8fe0-160c45fc3141">

### 2、本地开发
#### 1、使用Prisma

- 创建 D1数据库 `npx wrangler d1 create simple-checklist`
- 执行 `npx wrangler d1 migrations create simple-checklist some-name` 会创建一个空的migrations
- 执行 `npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > migrations/some-name`生成创建 sql 的文件
- 执行 `npx prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script > migrations/some-name`生成更新 sql 的文件
- 更新数据库到本地 `npx wrangler d1 migrations apply simple-checklist --local`
- 更新数据库到远程 `npx wrangler d1 migrations apply simple-checklist --remote`
