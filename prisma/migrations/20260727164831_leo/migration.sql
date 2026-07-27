/*
  Warnings:

  - The `executionResult` column on the `CodexJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'FINISHED');

-- CreateEnum
CREATE TYPE "ExecutionResult" AS ENUM ('RUNNING', 'SUCCESS', 'RUNTIME_ERROR', 'COMPILATION_ERROR');

-- AlterTable
ALTER TABLE "CodexJob" ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
DROP COLUMN "executionResult",
ADD COLUMN     "executionResult" "ExecutionResult",
ALTER COLUMN "stdout" DROP NOT NULL,
ALTER COLUMN "stderr" DROP NOT NULL,
ALTER COLUMN "exitCode" DROP NOT NULL;
