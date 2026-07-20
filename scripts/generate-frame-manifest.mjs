import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_FRAMES_DIR,
  DEFAULT_FRAME_BASE_PATH,
  EXPECTED_COUNT,
  frameName,
  parseArgs,
  pathExists,
  readJpegDimensions,
} from "./frame-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const framesDir = path.resolve(String(args.dir || DEFAULT_FRAMES_DIR));
const basePath = String(args.basePath || DEFAULT_FRAME_BASE_PATH).replace(/\/$/, "");
const outPath = path.resolve(String(args.out || path.join(framesDir, "frame-manifest.json")));
const frames = [];

for (let frame = 1; frame <= EXPECTED_COUNT; frame += 1) {
  const filePath = path.join(framesDir, frameName(frame));
  if (!(await pathExists(filePath))) {
    continue;
  }

  const dimensions = await readJpegDimensions(filePath);
  frames.push({
    frame,
    src: `${basePath}/${frameName(frame)}`,
    width: dimensions.width,
    height: dimensions.height,
  });
}

await writeFile(
  outPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), total: frames.length, frames }, null, 2)}\n`,
);
console.log(`Wrote manifest with ${frames.length} frames to ${outPath}`);
