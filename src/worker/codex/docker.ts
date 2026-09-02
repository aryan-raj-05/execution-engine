import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import type { Language } from "../../generated/prisma/enums.js";
import type { CodexJob } from "../../generated/prisma/client.js";
import type { executionResult } from "./index.js";

const dirPath = "/tmp/codex";

function getFileName(language: Language): string {
  switch (language) {
    case "C":
      return "main.c";
    case "CPP":
      return "main.cpp";
    case "JAVA":
      return "Main.java";
    case "PYTHON":
      return "lorem.py";
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

export function buildExecutionCommand(
  job: Pick<CodexJob, "language" | "stdin">,
): {
  image: string;
  command: string;
} {
  const stdinValue = job.stdin ?? "";
  const stdinPipe = stdinValue
    ? `printf '%s' ${JSON.stringify(stdinValue)} | `
    : "";

  switch (job.language) {
    case "C":
      return {
        image: "runner-gcc:1.0",
        command: `gcc /workspace/main.c -O2 -std=c11 -o /workspace/main && ${stdinPipe}/workspace/main`,
      };
    case "CPP":
      return {
        image: "runner-gcc:1.0",
        command: `g++ /workspace/main.cpp -O2 -std=c++17 -o /workspace/main && ${stdinPipe}/workspace/main`,
      };
    case "JAVA":
      return {
        image: "runner-java:1.0",
        command: `javac /workspace/Main.java && ${stdinPipe}java -cp /workspace Main`,
      };
    case "PYTHON":
      return {
        image: "runner-python:1.0",
        command: `${stdinPipe}python3 /workspace/lorem.py`,
      };
    default:
      throw new Error(`Unsupported language: ${job.language}`);
  }
}

async function createDirInTmp(): Promise<string> {
  const folderPath = path.join(dirPath, `job-${randomUUID()}`);

  try {
    await mkdir(folderPath, { recursive: true });
    return folderPath;
  } catch (err: any) {
    console.error(`Error creating folder: ${err.message}`);
    throw err;
  }
}

async function copyToTmp(
  folderPath: string,
  code: string,
  lang: Language,
): Promise<string> {
  const fileName = getFileName(lang);
  const filePath = path.join(folderPath, fileName);

  try {
    await writeFile(filePath, code, "utf8");
    return filePath;
  } catch (err: any) {
    console.error(`Error writing file: ${err.message}`);
    throw err;
  }
}

function runContainer(
  command: string,
  args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ stdout, stderr, exitCode: code });
    });
  });
}

export async function executeJob(job: CodexJob): Promise<executionResult> {
  const folderPath = await createDirInTmp();
  await copyToTmp(folderPath, job.sourceCode, job.language);

  const { image, command } = buildExecutionCommand(job);
  const result = await runContainer("docker", [
    "run",
    "--rm",
    "-i",
    "-v",
    `${folderPath}:/workspace`,
    "-w",
    "/workspace",
    image,
    "sh",
    "-lc",
    command,
  ]);

  return {
    stdout: result.stdout.trimEnd(),
    stderr: result.stderr.trimEnd(),
    exitCode: result.exitCode,
  };
}
