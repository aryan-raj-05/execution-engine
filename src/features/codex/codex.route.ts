import { Router } from "express";

import { codexGetSubmissionSchema, codexJobSchema } from "./codex.types.js";
import { asyncHandler } from "../../middlewares/async.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { authenticateUser } from "../../middlewares/auth.js";
import {
  getAllUserSubmissions,
  getSubmissionResult,
  queueCodeExJob,
} from "./codex.controller.js";

export const codexRouter: Router = Router();

codexRouter.get(
  "/:userId/submissions",
  authenticateUser,
  getAllUserSubmissions,
);

codexRouter.get(
  "/submission/:id",
  authenticateUser,
  validateParams(codexGetSubmissionSchema),
  getSubmissionResult,
);

codexRouter.post(
  "/execute",
  authenticateUser,
  validateBody(codexJobSchema),
  asyncHandler(queueCodeExJob),
);
