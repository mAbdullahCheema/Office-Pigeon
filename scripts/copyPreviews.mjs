import fs from "fs/promises";
import path from "path";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "previews");
const targetDir = path.join(rootDir, "dist", "previews");

try {
  await fs.access(sourceDir);
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true });
  console.log("Copied previews into dist/previews");
} catch (error) {
  if (error?.code === "ENOENT") {
    console.log("No previews directory found; skipping preview copy");
  } else {
    throw error;
  }
}
