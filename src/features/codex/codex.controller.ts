import type { RequestHandler } from "express";

import { prisma } from "../../utils/prisma.js";
import { codexJobQueue } from "../../queue/codex/codex.queue.js";
import type { CodexJob } from "./codex.types.js";

export const queueCodeExJob: RequestHandler<{}, any, CodexJob> = async (
  req,
  res,
) => {
  const { userId } = req.user!;
  const { code, stdin, language } = req.body;

  const job = await prisma.codexJob.create({
    data: {
      language,
      sourceCode: code,
      stdin: stdin ?? null,
      submittedBy: userId,
    },
  });

  await codexJobQueue.add("execute", { jobId: job.id });

  res.status(202).json({ executionId: job.id });
};
