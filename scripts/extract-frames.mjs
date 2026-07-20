import { mkdir } from "node:fs/promises";
import path from "node:path";
import extract from "extract-zip";
import { DEFAULT_EXTRACT_DIR, DEFAULT_ZIP, parseArgs, pathExists } from "./frame-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const zipPath = path.resolve(String(args.zip || DEFAULT_ZIP));
let outputDir = path.resolve(String(args.out || DEFAULT_EXTRACT_DIR));

if (!(await pathExists(zipPath))) {
  console.error(`Frame ZIP not found: ${zipPath}`);
  console.error("Place the supplied archive at assets/jpg-sequence.zip or pass --zip <path>.");
  process.exit(1);
}

if (await pathExists(outputDir)) {
  outputDir = `${outputDir}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

await mkdir(outputDir, { recursive: true });
await extract(zipPath, { dir: outputDir });

console.log(`Extracted frames to ${outputDir}`);
console.log("Next: npm run frames:rename -- --source <that-directory>");
