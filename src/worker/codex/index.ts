import { Worker } from "bullmq";
import { prisma } from "../../utils/prisma.js";
import { executeJob } from "./docker.js";
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
  await prisma.codexJob.update({
    where: { id: jobId },
    data: postExec,
  });
}

const worker = new Worker(
  "codex",
  async (job) => {
    console.log(`Processing job ${job.id}`);

    if (!job.id) return;

    const codexJob = await getJob(Number(job.id));
    const result = await executeJob(codexJob);
    await updateDatabase(codexJob.id, result);
  },
  {
    connection: {
      host: "localhost",
      port: 6397,
    },
  },
);
