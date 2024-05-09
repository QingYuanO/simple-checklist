### 1、使用Prisma

- 创建 D1数据库 `npx wrangler d1 simple-checklist`
- 执行 `npx wrangler d1 migrations create simple-checklist some-name` 会创建一个空的migrations
- 执行 `npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > migrations/some-name`生成创建 spl 的文件
- 更新数据库到本地 `npx wrangler d1 migrations apply simple-checklist --local`
- 更新数据库到远程 `npx wrangler d1 migrations apply simple-checklist --remote`
