import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const EXPECTED_COUNT = 264;
export const EXPECTED_WIDTH = 1920;
export const EXPECTED_HEIGHT = 1080;
export const DEFAULT_FRAME_BASE_PATH = "/frames-hq";
export const DEFAULT_ZIP = path.resolve("assets", "jpg-sequence.zip");
export const DEFAULT_EXTRACT_DIR = path.resolve("work", "extracted-frames");
export const DEFAULT_FRAMES_DIR = path.resolve("public", "frames-hq");

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      continue;
    }

    const [key, inline] = value.slice(2).split("=");
    args[key] = inline ?? argv[index + 1] ?? true;
    if (!inline && argv[index + 1] && !argv[index + 1].startsWith("--")) {
      index += 1;
    }
  }

  return args;
}

export async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export async function findJpegs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJpegs(fullPath)));
      continue;
    }

    if (/\.(jpe?g)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files.sort(naturalCompare);
}

export async function readJpegDimensions(filePath) {
  const buffer = await readFile(filePath);
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error(`${filePath} is not a JPEG file.`);
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  throw new Error(`Could not read JPEG dimensions for ${filePath}.`);
}

export function frameName(frame) {
  return `frame_${String(frame).padStart(4, "0")}.jpg`;
}
