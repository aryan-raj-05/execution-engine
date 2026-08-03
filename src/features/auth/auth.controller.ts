import type { RequestHandler } from "express";

import { prisma } from "../../utils/prisma.js";
import { comparePassword, hashPassword } from "../../utils/passwords.js";
import { generateToken } from "../../utils/token.js";
import type { CreateUser, LoginUser } from "./auth.types.js";

export const createUser: RequestHandler<{}, any, CreateUser> = async (
  req,
  res,
) => {
  const { name, email, password } = req.body;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  const token = generateToken(user.id);

  return res.status(201).json({ token });
};

export const loginUser: RequestHandler<{}, any, LoginUser> = async (
  req,
  res,
) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid Email or Password" });
  }

  if (!(await comparePassword(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid Email or Password" });
  }

  const token = generateToken(user.id);
  return res.status(200).json({ token });
};
