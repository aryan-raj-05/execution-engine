import express from "express";
import morgan from "morgan";
import { config } from "./utils/config.js";
import type { Express, Request, Response } from "express";

export const app: Express = express();

app.use(express.json());
if (config.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});
