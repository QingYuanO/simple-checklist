-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "name" TEXT,
    "phone" TEXT,
    "account" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_clerk" BOOLEAN DEFAULT false
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
    "shop_owner_memo" TEXT,
    "status" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "goods_list" TEXT NOT NULL DEFAULT '[]',
    "user_id" TEXT,
    CONSTRAINT "check_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_key" ON "user"("account");

