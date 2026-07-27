import { Router } from "express";

import { codexJobSchema } from "./codex.types.js";
import { queueCodeExJob } from "./codex.controller.js";
import { asyncHandler } from "../../middlewares/async.js";
import { validateBody } from "../../middlewares/validate.js";
import { authenticateUser } from "../../middlewares/auth.js";

export const codexRouter: Router = Router();

// TODO
codexRouter.get("/submission", authenticateUser, () => {});

// TODO
codexRouter.get("/submission/:id", authenticateUser, () => {});

codexRouter.post(
  "/execute",
  authenticateUser,
  validateBody(codexJobSchema),
  asyncHandler(queueCodeExJob),
);
