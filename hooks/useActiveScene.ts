"use client";

import { useMemo } from "react";
import { getSceneProgressByFrame } from "@/lib/scene-progress";

export function useActiveScene(frame: number) {
  return useMemo(() => getSceneProgressByFrame(frame), [frame]);
}
