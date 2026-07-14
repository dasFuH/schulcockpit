-- Add one active, hashed password-reset token per user and a versioned
-- session revocation counter. Existing JWTs are treated as version 0.
ALTER TABLE "users"
ADD COLUMN "passwordResetTokenHash" TEXT,
ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3),
ADD COLUMN "passwordResetRequestedAt" TIMESTAMP(3),
ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "users_passwordResetTokenHash_idx"
ON "users"("passwordResetTokenHash");
