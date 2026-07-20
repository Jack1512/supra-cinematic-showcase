"use client";

import { SceneContent } from "@/components/cinematic/SceneContent";
import { SCENE_BY_ID } from "@/config/scenes";
import type { SequenceProgress } from "@/types/cinematic";

type SceneOverlayProps = {
  sequence: SequenceProgress;
  onBegin: () => void;
  onPerformance: () => void;
  onTestDrive: () => void;
  onReplay: () => void;
};

export function SceneOverlay({ sequence, onBegin, onPerformance, onReplay, onTestDrive }: SceneOverlayProps) {
  const scene = SCENE_BY_ID[sequence.scene];

  return (
    <div className={`scene-overlay scene-overlay--${scene.id}`}>
      <div className="technical-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <SceneContent
        scene={scene}
        sceneProgress={sequence.sceneProgress}
        onBegin={onBegin}
        onPerformance={onPerformance}
        onReplay={onReplay}
        onTestDrive={onTestDrive}
      />
    </div>
  );
}
