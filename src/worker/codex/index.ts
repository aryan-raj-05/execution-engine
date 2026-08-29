import { Worker } from "bullmq";
import { exec, spawn } from "node:child_process";
import path from "node:path";

const executeDev = () => {
  const fileName = "abc.js";
  const hostFile = path.resolve("jobs", fileName);

  const child = spawn("docker", [
    "run",
    "--rm",
    "-v",
    `${hostFile}:/node_workspace/${fileName}:ro`,
    "runner-node:1.0",
    "node",
    `/node_workspace/${fileName}`,
  ]);

  child.stdout.on("data", (d) => process.stdout.write(d));
  child.stderr.on("data", (d) => process.stderr.write(d));
};

const worker = new Worker(
  "codex",
  async (job) => {
    console.log(`Processing job ${job.id}`);
  },
  {
    connection: {
      host: "localhost",
      port: 6397,
    },
  },
);
