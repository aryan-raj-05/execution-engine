import { Router } from "express";

import { asyncHandler } from "../../middlewares/async.js";
import { validateBody } from "../../middlewares/validate.js";
import { createUser, loginUser } from "./auth.controller.js";
import { createUserSchema, loginUserSchema } from "./auth.types.js";

export const authRouter: Router = Router();

authRouter.post(
  "/sign-in",
  validateBody(loginUserSchema),
  asyncHandler(loginUser),
);

authRouter.post(
  "/sign-up",
  validateBody(createUserSchema),
  asyncHandler(createUser),
);
