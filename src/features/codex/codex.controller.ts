import type { RequestHandler } from "express";

import { prisma } from "../../utils/prisma.js";
import { codexJobQueue } from "../../queue/codex/codex.queue.js";
import type { CodexGetSubmission, CodexJob } from "./codex.types.js";

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

export const getSubmissionResult: RequestHandler<CodexGetSubmission> = async (
  req,
  res,
) => {
  const id = Number(req.params.id);

  const result = await prisma.codexJob.findUnique({ where: { id: id } });
  if (!result) {
    return res.status(404).json({ message: "submission doesn't exist " });
  }

  if (result.status == "QUEUED" || result.status == "RUNNING") {
    return res.status(202).json({ message: "task is running" });
  }

  return res.status(200).json(result);
};

export const getAllUserSubmissions: RequestHandler = async (req, res) => {
  const { userId } = req.user!;

  const result = await prisma.codexJob.findMany({
    where: { submittedBy: userId },
  });

  return res.status(200).json(result);
};
