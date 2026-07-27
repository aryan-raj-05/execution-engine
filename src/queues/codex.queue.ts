import { Queue } from "bullmq";

export const codexJobQueue = new Queue("codex", {
  connection: {
    host: "localhost",
    port: 6397,
  },
});
