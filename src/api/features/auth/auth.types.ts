import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(4),
  email: z.email(),
  password: z.string().min(8),
});

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
