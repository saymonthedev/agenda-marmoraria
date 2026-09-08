-- DropForeignKey
ALTER TABLE "project_notes" DROP CONSTRAINT "project_notes_authorId_fkey";

-- AlterTable
ALTER TABLE "project_notes" ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
