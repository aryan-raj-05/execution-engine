import { exec } from "node:child_process";

const fileName = "test.js";

function execute(code: string) {
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
}
