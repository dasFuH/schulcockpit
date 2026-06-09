-- Add parent -> student account linkage for scoped parent dashboards.
ALTER TABLE "users" ADD COLUMN "managedStudentId" TEXT;

-- Preserve current MVP behavior for existing installations by linking
-- existing parent accounts to the first existing student account.
WITH first_student AS (
  SELECT "id"
  FROM "users"
  WHERE "role" = 'STUDENT'
  ORDER BY "createdAt" ASC
  LIMIT 1
)
UPDATE "users"
SET "managedStudentId" = (SELECT "id" FROM first_student)
WHERE "role" = 'PARENT'
  AND EXISTS (SELECT 1 FROM first_student);

CREATE INDEX "users_managedStudentId_idx" ON "users"("managedStudentId");

ALTER TABLE "users"
ADD CONSTRAINT "users_managedStudentId_fkey"
FOREIGN KEY ("managedStudentId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
