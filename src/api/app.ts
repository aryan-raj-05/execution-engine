import express from "express";
import morgan from "morgan";
import type { Express } from "express";

import { config } from "./utils/config.js";
import { authRouter } from "./features/auth/auth.route.js";
import { codexRouter } from "./features/codex/codex.route.js";
import { errorHandler } from "./middlewares/error.js";

export const app: Express = express();

app.use(express.json());
if (config.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use("/api/auth", authRouter);
app.use("/api/exec", codexRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);
