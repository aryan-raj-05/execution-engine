import express from "express";
import morgan from "morgan";
import type { Express, Request, Response } from "express";

import { userRouter } from "./features/users/users.routes.js";
import { config } from "./utils/config.js";

export const app: Express = express();

app.use(express.json());
if (config.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});
