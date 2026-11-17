-- CreateEnum
CREATE TYPE "instagram_connection_status" AS ENUM ('connected', 'disconnected', 'expired', 'revoked');

-- CreateTable
CREATE TABLE "instagram_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "instagram_user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "profile_picture_url" TEXT,
    "account_type" TEXT,
    "followers_count" INTEGER,
    "follows_count" INTEGER,
    "media_count" INTEGER,
    "access_token_encrypted" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "token_issued_at" TIMESTAMP(3),
    "scopes" TEXT NOT NULL,
    "connection_status" "instagram_connection_status" NOT NULL,
    "last_synced_at" TIMESTAMP(3),
    "connected_at" TIMESTAMP(3) NOT NULL,
    "disconnected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_oauth_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "state_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_oauth_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instagram_accounts_user_id_key" ON "instagram_accounts"("user_id");

-- CreateIndex
CREATE INDEX "instagram_accounts_instagram_user_id_idx" ON "instagram_accounts"("instagram_user_id");

-- One active connection for an Instagram professional account.
CREATE UNIQUE INDEX "instagram_accounts_active_instagram_user_key"
  ON "instagram_accounts"("instagram_user_id")
  WHERE "connection_status" = 'connected';

-- CreateIndex
CREATE UNIQUE INDEX "instagram_oauth_states_state_hash_key" ON "instagram_oauth_states"("state_hash");

-- CreateIndex
CREATE INDEX "instagram_oauth_states_user_id_idx" ON "instagram_oauth_states"("user_id");

-- CreateIndex
CREATE INDEX "instagram_oauth_states_expires_at_idx" ON "instagram_oauth_states"("expires_at");

-- AddForeignKey
ALTER TABLE "instagram_accounts"
  ADD CONSTRAINT "instagram_accounts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_oauth_states"
  ADD CONSTRAINT "instagram_oauth_states_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
