import express from "express";
import { exec } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const code = `
console.log("hello world")
for (let i = 0; i < 10; i++) {
  console.log(i * 2)
}
`;

const fileName = "test.js";
const filePath = join("/jobs", fileName);
await writeFile(filePath, code);

exec(
  `docker run --rm \
    -v execution-engine_shared-jobs:/jobs \
    runner-node:1.0 \
    sh -c "node /jobs/${fileName}"`,
  (err, stdout, stderr) => {
    console.log("err:", err);
    console.log("stdout:", JSON.stringify(stdout));
    console.log("stderr:", JSON.stringify(stderr));
  },
);

const app = express();
app.get("/", (req, res) => {
  res.send("hello");
});
app.listen(3001, () => {
  console.log("listening on port 3001");
});
