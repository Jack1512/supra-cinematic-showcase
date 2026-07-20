import { FRAME_BASE_PATH, FRAME_RANGES, SCENES, TOTAL_FRAMES } from "@/config/scenes";
import type { SceneId } from "@/types/cinematic";

export function clampFrame(frame: number, totalFrames = TOTAL_FRAMES) {
  return Math.min(Math.max(Math.round(frame), 1), totalFrames);
}

export function getFrameUrl(frame: number) {
  return `${FRAME_BASE_PATH}/frame_${String(clampFrame(frame)).padStart(4, "0")}.jpg`;
}

export function progressToFrame(progress: number, totalFrames = TOTAL_FRAMES) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return clampFrame(1 + clamped * (totalFrames - 1), totalFrames);
}

export function frameToProgress(frame: number, totalFrames = TOTAL_FRAMES) {
  if (totalFrames <= 1) {
    return 0;
  }

  return (clampFrame(frame, totalFrames) - 1) / (totalFrames - 1);
}

export function frameToScrollY(frame: number, startY: number, endY: number, totalFrames = TOTAL_FRAMES) {
  const distance = Math.max(endY - startY, 0);
  return startY + distance * frameToProgress(frame, totalFrames);
}

export function scrollYToFrame(scrollY: number, startY: number, endY: number, totalFrames = TOTAL_FRAMES) {
  const distance = Math.max(endY - startY, 1);
  return progressToFrame((scrollY - startY) / distance, totalFrames);
}

export function framesBetween(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

export function buildSceneAnchorFrames(sceneIds: SceneId[] = SCENES.map((scene) => scene.id)) {
  const frames = new Set<number>([1, TOTAL_FRAMES]);

  for (const sceneId of sceneIds) {
    const range = FRAME_RANGES[sceneId];
    for (const boundary of [range.start, range.end]) {
      for (let offset = -3; offset <= 3; offset += 1) {
        frames.add(clampFrame(boundary + offset));
      }
    }
  }

  return [...frames].sort((a, b) => a - b);
}

export function buildSparseFrames(step = 3, totalFrames = TOTAL_FRAMES) {
  const frames = new Set<number>([1, totalFrames]);
  for (let frame = 1; frame <= totalFrames; frame += step) {
    frames.add(frame);
  }

  return [...frames].sort((a, b) => a - b);
}

export function buildFrameLoadPlan(totalFrames = TOTAL_FRAMES) {
  const critical = framesBetween(1, Math.min(24, totalFrames));
  const anchors = buildSceneAnchorFrames().filter((frame) => frame <= totalFrames);
  const sparse = buildSparseFrames(3, totalFrames);
  const requested = new Set([...critical, ...anchors, ...sparse]);
  const remaining = framesBetween(1, totalFrames).filter((frame) => !requested.has(frame));

  return {
    critical,
    anchors,
    sparse,
    remaining,
  };
}
