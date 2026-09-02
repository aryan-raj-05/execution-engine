import { Worker } from "bullmq";
import { executeJob } from "./docker.js";
import { prisma } from "../../utils/prisma.js";
import { JobStatus, ExecutionResult } from "../../generated/prisma/enums.js";
import type { CodexJob } from "../../generated/prisma/client.js";

export type executionResult = {
  stdout?: string;
  stderr?: string;
  exitCode: number | null;
};

async function getJob(jobId: number): Promise<CodexJob> {
  const job = await prisma.codexJob.findUnique({ where: { id: jobId } });

  if (!job) {
    throw Error("Job doesn't exist in Database");
  }

  return job;
}

async function updateDatabase(
  jobId: number,
  postExec: executionResult,
): Promise<void> {
  const executionStatus =
    postExec.exitCode === 0
      ? ExecutionResult.SUCCESS
      : postExec.stderr?.toLowerCase().includes("error")
        ? ExecutionResult.COMPILATION_ERROR
        : ExecutionResult.RUNTIME_ERROR;

  await prisma.codexJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.FINISHED,
      executionResult: executionStatus,
      stdout: postExec.stdout ?? null,
      stderr: postExec.stderr ?? null,
      exitCode: postExec.exitCode ?? null,
    },
  });
}

export const worker = new Worker(
  "codex",
  async (job) => {
    console.log(`Processing job ${job.id}`);

    if (!job.id) return;

    const codexJob = await getJob(Number(job.id));

    await prisma.codexJob.update({
      where: { id: codexJob.id },
      data: {
        status: JobStatus.RUNNING,
      },
    });

    const result = await executeJob(codexJob);
    await updateDatabase(codexJob.id, result);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});
