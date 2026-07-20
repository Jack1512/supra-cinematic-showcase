"use client";

import { ReducedMotionExperience } from "@/components/cinematic/ReducedMotionExperience";
import { ScrollImageSequence, type SequenceController } from "@/components/cinematic/ScrollImageSequence";
import type { SceneId, SequenceProgress } from "@/types/cinematic";

type CinematicExperienceProps = {
  reducedMotion: boolean;
  onControllerReady: (controller: SequenceController | null) => void;
  onProgressChange: (sequence: SequenceProgress) => void;
  onFallbackRequest: () => void;
  onNavigateScene: (sceneId: SceneId) => void;
  onTestDrive: () => void;
  onReplay: () => void;
  scrollToY: (target: number, options?: { immediate?: boolean }) => void;
};

export function CinematicExperience({
  onControllerReady,
  onFallbackRequest,
  onNavigateScene,
  onProgressChange,
  onReplay,
  onTestDrive,
  reducedMotion,
  scrollToY,
}: CinematicExperienceProps) {
  if (reducedMotion) {
    return (
      <ReducedMotionExperience
        onNavigateScene={onNavigateScene}
        onProgressChange={onProgressChange}
        onReplay={onReplay}
        onTestDrive={onTestDrive}
      />
    );
  }

  return (
    <ScrollImageSequence
      onControllerReady={onControllerReady}
      onProgressChange={onProgressChange}
      onFallbackRequest={onFallbackRequest}
      onTestDrive={onTestDrive}
      scrollToY={scrollToY}
    />
  );
}
