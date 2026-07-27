import type { RequestHandler } from "express";
import { decodeToken } from "../utils/token.js";

export const authenticateUser: RequestHandler = (req, res, next) => {
  const bearerToken = req.headers.authorization;
  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized Access." });
  }

  const token = bearerToken.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access." });
  }

  let decoded;

  try {
    decoded = decodeToken(token) as { userId: number };
  } catch {
    return res
      .status(401)
      .json({ message: "Invalid or expired token. Sign-in again." });
  }

  req.user = decoded.userId;
  next();
};
