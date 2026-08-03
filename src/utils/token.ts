import jwt from "jsonwebtoken";
import { config } from "./config.js";

export const generateToken = (userId: number) =>
  jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: "2h" });

export const decodeToken = (token: string) =>
  jwt.verify(token, config.JWT_SECRET);
