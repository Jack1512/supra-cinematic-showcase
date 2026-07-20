"use client";

import { useCallback, useRef, useState } from "react";
import { CinematicExperience } from "@/components/cinematic/CinematicExperience";
import type { SequenceController } from "@/components/cinematic/ScrollImageSequence";
import { Header } from "@/components/navigation/Header";
import { DisclaimerSection } from "@/components/sections/DisclaimerSection";
import { ExperienceTransition } from "@/components/sections/ExperienceTransition";
import { ConfigurationSection } from "@/components/sections/ConfigurationSection";
import { Footer } from "@/components/sections/Footer";
import { TestDriveSection } from "@/components/sections/TestDriveSection";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useConceptSound } from "@/hooks/useConceptSound";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import type { SceneId, SequenceProgress } from "@/types/cinematic";
import { DEFAULT_CONFIGURATION, type SupraConfiguration } from "@/types/configuration";

const INITIAL_SEQUENCE: SequenceProgress = {
  frame: 1,
  progress: 0,
  scene: "hero",
  sceneProgress: 0,
};

export function SupraPageShell() {
  const [configuration, setConfiguration] = useState<SupraConfiguration>(DEFAULT_CONFIGURATION);
  const [sequence, setSequence] = useState<SequenceProgress>(INITIAL_SEQUENCE);
  const [forcedStatic, setForcedStatic] = useState(false);
  const controllerRef = useRef<SequenceController | null>(null);
  const { reducedMotion, setReducedMotion } = useReducedMotionPreference();
  const effectiveReducedMotion = reducedMotion || forcedStatic;
  const { scrollTo } = useLenisScroll(effectiveReducedMotion);
  const conceptSound = useConceptSound(sequence.progress, effectiveReducedMotion);

  const scrollToY = useCallback(
    (target: number, options?: { immediate?: boolean }) => {
      scrollTo(target, options);
    },
    [scrollTo],
  );

  const handleNavigateScene = useCallback(
    (sceneId: SceneId) => {
      if (effectiveReducedMotion) {
        const element = document.getElementById(`scene-${sceneId}`);
        if (element) {
          scrollTo(element, { offset: -72 });
          return;
        }
      }

      controllerRef.current?.scrollToScene(sceneId);
    },
    [effectiveReducedMotion, scrollTo],
  );

  const handleTestDrive = useCallback(() => {
    scrollTo("#enquiry", { offset: -72 });
  }, [scrollTo]);

  const handleReplay = useCallback(() => {
    if (effectiveReducedMotion) {
      scrollTo("#main", { immediate: false });
      return;
    }

    controllerRef.current?.replay();
  }, [effectiveReducedMotion, scrollTo]);

  return (
    <>
      <Header
        activeScene={sequence.scene}
        progress={sequence.progress}
        reducedMotion={effectiveReducedMotion}
        soundEnabled={conceptSound.enabled}
        soundSupported={conceptSound.supported}
        onNavigateScene={handleNavigateScene}
        onTestDrive={handleTestDrive}
        onToggleSound={conceptSound.toggle}
        onToggleReducedMotion={() => {
          setForcedStatic(false);
          setReducedMotion(!effectiveReducedMotion);
        }}
      />
      <main id="main" tabIndex={-1}>
        <CinematicExperience
          reducedMotion={effectiveReducedMotion}
          onControllerReady={(controller) => {
            controllerRef.current = controller;
          }}
          onProgressChange={setSequence}
          onFallbackRequest={() => setForcedStatic(true)}
          onNavigateScene={handleNavigateScene}
          onTestDrive={handleTestDrive}
          onReplay={handleReplay}
          scrollToY={scrollToY}
        />
        <ExperienceTransition />
        <ConfigurationSection configuration={configuration} onChange={setConfiguration} />
        <TestDriveSection configuration={configuration} />
        <DisclaimerSection />
      </main>
      <Footer onNavigateScene={handleNavigateScene} onTestDrive={handleTestDrive} />
    </>
  );
}
