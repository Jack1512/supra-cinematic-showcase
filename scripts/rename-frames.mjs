import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_EXTRACT_DIR,
  DEFAULT_FRAMES_DIR,
  EXPECTED_COUNT,
  findJpegs,
  frameName,
  parseArgs,
  pathExists,
} from "./frame-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const source = path.resolve(String(args.source || DEFAULT_EXTRACT_DIR));
const destination = path.resolve(String(args.dest || DEFAULT_FRAMES_DIR));
const overwrite = Boolean(args.overwrite);

if (!(await pathExists(source))) {
  console.error(`Source directory not found: ${source}`);
  process.exit(1);
}

const jpegs = await findJpegs(source);
if (jpegs.length === 0) {
  console.error(`No JPG files found in ${source}`);
  process.exit(1);
}

if (jpegs.length !== EXPECTED_COUNT) {
  console.warn(`Expected ${EXPECTED_COUNT} JPG files but found ${jpegs.length}. Continuing with chronological copy.`);
}

await mkdir(destination, { recursive: true });

for (const [index, file] of jpegs.entries()) {
  const target = path.join(destination, frameName(index + 1));
  if (!overwrite && (await pathExists(target))) {
    throw new Error(`${target} already exists. Re-run with --overwrite to replace generated frame copies.`);
  }
  await copyFile(file, target);
}

console.log(`Copied ${jpegs.length} frames into ${destination}`);
console.log("Next: npm run frames:validate");
