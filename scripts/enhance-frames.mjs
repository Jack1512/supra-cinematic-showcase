import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  DEFAULT_FRAMES_DIR,
  EXPECTED_COUNT,
  frameName,
  parseArgs,
  pathExists,
} from "./frame-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const sourceDir = path.resolve(String(args.source || DEFAULT_FRAMES_DIR));
const destinationDir = path.resolve(String(args.dest || path.join("public", "frames-enhanced")));
const width = Number(args.width || 1920);
const height = Number(args.height || 1080);
const quality = Number(args.quality || 92);

if (!(await pathExists(sourceDir))) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(1);
}

await mkdir(destinationDir, { recursive: true });

let enhanced = 0;
for (let frame = 1; frame <= EXPECTED_COUNT; frame += 1) {
  const sourcePath = path.join(sourceDir, frameName(frame));
  if (!(await pathExists(sourcePath))) {
    throw new Error(`Missing source frame: ${sourcePath}`);
  }

  const destinationPath = path.join(destinationDir, frameName(frame));
  await sharp(sourcePath)
    .resize(width, height, {
      fit: "cover",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .sharpen({
      sigma: 0.85,
      m1: 0.75,
      m2: 1.7,
      x1: 1.4,
      y2: 10,
      y3: 18,
    })
    .modulate({
      brightness: 1.02,
      saturation: 1.06,
    })
    .jpeg({
      quality,
      mozjpeg: true,
      chromaSubsampling: "4:4:4",
    })
    .toFile(destinationPath);

  enhanced += 1;
}

console.log(`Enhanced ${enhanced} frames to ${destinationDir} at ${width}x${height}, JPEG quality ${quality}.`);
