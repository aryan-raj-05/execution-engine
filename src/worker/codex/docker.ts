import path from "node:path";
import { randomUUID } from "node:crypto";
import { exec, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import type { Language } from "../../generated/prisma/enums.js";
import type { executionResult } from "./index.js";
import type { CodexJob } from "../../generated/prisma/client.js";

// 1. create a temporary directory in /tmp or /var folder on linux system
// 2. then copy the code sent to be executed there
// 3. fire docker with /tmp/... as a shared mount
// 4. have docker execute them and write stdout, stderr, exit codes, etc.
// 5. read it from the current process
// 6. return the result
const dirPath = "/tmp/codex/";

async function createDirInTmp(): Promise<string> {
  const folderName = `job-${randomUUID()}`;
  const folderPath = path.join(dirPath, folderName);

  try {
    await mkdir(folderPath, { recursive: true }); // should i use mkdtemp?
    console.log(`Created folder: ${folderPath}`);
    return folderName;
  } catch (err: any) {
    console.error(`Error creating folder: ${err.message}`);
    throw err;
  }
}

async function copyToTmp(folderName: string, code: string, lang: Language) {
  const fileExtension = (() => {
    switch (lang) {
      case "C":
        return ".c";
      case "CPP":
        return ".cpp";
      case "JAVA":
        return ".java";
      case "PYTHON":
        return ".py";
      default:
        throw new Error(`Unsupported language: ${lang}`);
    }
  })();

  const filePath = path.join(dirPath, folderName, `lorem${fileExtension}`);

  try {
    await writeFile(filePath, code, "utf8");
    console.log(`File created at ${filePath}`);
  } catch (err: any) {
    console.error(`Error writing file: ${err.message}`);
    throw err;
  }
}

// TODO
function getRunCommand(fileName: string) {}

function runContainer(command: string, args: string[]) {
  return new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
  }>((resolve) => {
    const child = spawn(command, args);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({ stdout, stderr, exitCode: code });
    });
  });
}

// TODO
export async function executeJob(job: CodexJob): Promise<executionResult> {
  const folderName = await createDirInTmp();
  await copyToTmp(folderName, job.sourceCode, job.language);

  let args = [
    "run",
    "--rm",
    "-v",
    `${path.join(dirPath, folderName)}:/workspace`,
    "TODO-docker-image",
    "sh",
    "-c",
  ];

  return await runContainer("docker", args);
}

const result = await runContainer("docker", [
  "run",
  "--rm",
  "-v",
  "execution-engine_shared-jobs:/jobs",
  "runner-node:1.0",
  "sh",
  "-c",
  "node /jobs/lorem.js",
]);
