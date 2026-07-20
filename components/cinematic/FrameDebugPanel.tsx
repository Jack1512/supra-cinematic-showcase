"use client";

import type { SequenceProgress } from "@/types/cinematic";

export function FrameDebugPanel({ sequence }: { sequence: SequenceProgress }) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <aside className="frame-debug" aria-label="Development frame debug panel">
      <span>Frame {sequence.frame}</span>
      <span>Progress {(sequence.progress * 100).toFixed(1)}%</span>
      <span>Scene {sequence.scene}</span>
      <span>Scene {(sequence.sceneProgress * 100).toFixed(1)}%</span>
    </aside>
  );
}
