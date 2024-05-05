-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "name" TEXT,
    "phone" TEXT,
    "openid" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "goods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "isActivity" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "check_list" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "name" TEXT NOT NULL,
    "memo" TEXT,
    "status" TEXT NOT NULL,
    "address" TEXT,
    "user_id" TEXT,
    CONSTRAINT "check_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "check_list_on_goods" (
    "goods_id" TEXT NOT NULL,
    "check_list_id" TEXT NOT NULL,
    "assigned_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("goods_id", "check_list_id"),
    CONSTRAINT "check_list_on_goods_goods_id_fkey" FOREIGN KEY ("goods_id") REFERENCES "goods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "check_list_on_goods_check_list_id_fkey" FOREIGN KEY ("check_list_id") REFERENCES "check_list" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_openid_key" ON "user"("openid");

-- CreateIndex
CREATE UNIQUE INDEX "goods_name_key" ON "goods"("name");

