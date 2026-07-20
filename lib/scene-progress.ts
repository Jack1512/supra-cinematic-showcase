import { SCENES, TOTAL_FRAMES } from "@/config/scenes";
import type { SceneDefinition, SceneId } from "@/types/cinematic";
import { clampFrame, frameToProgress } from "./frames";

export function getActiveScene(frame: number, scenes: SceneDefinition[] = SCENES): SceneDefinition {
  const clampedFrame = clampFrame(frame);
  return (
    scenes.find((scene) => clampedFrame >= scene.start && clampedFrame <= scene.end) ??
    scenes[scenes.length - 1]
  );
}

export function getSceneProgress(frame: number, scene: SceneDefinition) {
  const span = Math.max(scene.end - scene.start, 1);
  return Math.min(Math.max((clampFrame(frame) - scene.start) / span, 0), 1);
}

export function getSceneProgressByFrame(frame: number) {
  const scene = getActiveScene(frame);

  return {
    scene,
    sceneProgress: getSceneProgress(frame, scene),
  };
}

export function getNavigationTargetFrame(sceneId: SceneId) {
  const scene = SCENES.find((item) => item.id === sceneId);
  if (!scene) {
    return 1;
  }

  return scene.start;
}

export function getNavigationTargetProgress(sceneId: SceneId, totalFrames = TOTAL_FRAMES) {
  return frameToProgress(getNavigationTargetFrame(sceneId), totalFrames);
}
