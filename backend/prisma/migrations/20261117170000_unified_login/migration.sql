-- CreateEnum
CREATE TYPE "instagram_auth_method" AS ENUM ('instagram_login', 'unified_login');

-- AlterTable
ALTER TABLE "instagram_accounts"
ADD COLUMN "auth_method" "instagram_auth_method" NOT NULL DEFAULT 'instagram_login',
ADD COLUMN "client_business_id" TEXT;
