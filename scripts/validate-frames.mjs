import path from "node:path";
import {
  DEFAULT_FRAMES_DIR,
  EXPECTED_COUNT,
  EXPECTED_HEIGHT,
  EXPECTED_WIDTH,
  frameName,
  parseArgs,
  pathExists,
  readJpegDimensions,
} from "./frame-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const framesDir = path.resolve(String(args.dir || DEFAULT_FRAMES_DIR));
const expectedCount = Number(args.count || EXPECTED_COUNT);

if (!(await pathExists(framesDir))) {
  console.error(`Frames directory not found: ${framesDir}`);
  process.exit(1);
}

const missing = [];
const mismatched = [];
const corrupt = [];
let dimensions = null;

for (let frame = 1; frame <= expectedCount; frame += 1) {
  const filePath = path.join(framesDir, frameName(frame));
  if (!(await pathExists(filePath))) {
    missing.push(frame);
    continue;
  }

  try {
    const size = await readJpegDimensions(filePath);
    dimensions ??= size;
    if (size.width !== dimensions.width || size.height !== dimensions.height) {
      mismatched.push({ frame, ...size });
    }
  } catch (error) {
    corrupt.push({ frame, error: error instanceof Error ? error.message : String(error) });
  }
}

if (missing.length || mismatched.length || corrupt.length) {
  console.error("Frame validation failed.");
  if (missing.length) console.error(`Missing frames: ${missing.join(", ")}`);
  if (mismatched.length) console.error(`Mismatched dimensions: ${JSON.stringify(mismatched, null, 2)}`);
  if (corrupt.length) console.error(`Corrupt/unreadable frames: ${JSON.stringify(corrupt, null, 2)}`);
  process.exit(1);
}

if (dimensions?.width !== EXPECTED_WIDTH || dimensions?.height !== EXPECTED_HEIGHT) {
  console.warn(
    `Frames are ${dimensions?.width}x${dimensions?.height}; expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}.`,
  );
}

console.log(`Validated ${expectedCount} frames at ${dimensions?.width}x${dimensions?.height}.`);
