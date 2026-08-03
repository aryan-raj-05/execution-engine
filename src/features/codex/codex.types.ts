import z from "zod";

export const codexJobSchema = z.object({
  code: z.string().min(2),
  stdin: z.string().optional(),
  language: z.enum(["C", "CPP", "JAVA", "PYTHON"]),
});

export type CodexJob = z.infer<typeof codexJobSchema>;
