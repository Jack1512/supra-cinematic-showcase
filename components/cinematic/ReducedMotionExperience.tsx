"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SCENES } from "@/config/scenes";
import { frameToProgress, getFrameUrl } from "@/lib/frames";
import type { SceneId, SequenceProgress } from "@/types/cinematic";

type ReducedMotionExperienceProps = {
  onNavigateScene: (sceneId: SceneId) => void;
  onTestDrive: () => void;
  onReplay: () => void;
  onProgressChange: (sequence: SequenceProgress) => void;
};

export function ReducedMotionExperience({
  onNavigateScene,
  onProgressChange,
  onReplay,
  onTestDrive,
}: ReducedMotionExperienceProps) {
  useEffect(() => {
    const elements = SCENES.map((scene) => document.querySelector<HTMLElement>(`[data-scene-id="${scene.id}"]`)).filter(
      (element): element is HTMLElement => Boolean(element),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const sceneId = active?.target.getAttribute("data-scene-id") as SceneId | null;
        const scene = SCENES.find((item) => item.id === sceneId);

        if (scene) {
          onProgressChange({
            frame: scene.representativeFrame,
            progress: frameToProgress(scene.representativeFrame),
            scene: scene.id,
            sceneProgress: 0.5,
          });
        }
      },
      {
        rootMargin: "-38% 0px -42% 0px",
        threshold: [0.15, 0.35, 0.6, 0.85],
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [onProgressChange]);

  return (
    <section className="reduced-motion-experience" aria-label="Reduced motion Toyota GR Supra concept experience">
      {SCENES.map((scene) => (
        <article id={`scene-${scene.id}`} data-scene-id={scene.id} key={scene.id} className="static-scene">
          <div className="static-scene-media" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getFrameUrl(scene.representativeFrame)} alt="" loading="lazy" />
          </div>
          <div className="static-scene-copy">
            <p className="micro-label">{scene.eyebrow}</p>
            <h2>{scene.heading}</h2>
            {scene.body ? <p>{scene.body}</p> : null}
            {scene.metrics ? (
              <div className="metric-strip">
                {scene.metrics.map((metric) => (
                  <div key={metric.value} className="metric">
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {scene.features ? (
              <div className="feature-labels is-static">
                {scene.features.map((feature) => (
                  <span key={feature} className="is-active">
                    {feature}
                  </span>
                ))}
              </div>
            ) : null}
            {scene.id === "hero" ? (
              <div className="scene-actions">
                <Button onClick={() => onNavigateScene("exterior")}>Begin the experience</Button>
                <Button variant="ghost" onClick={() => onNavigateScene("performance")}>
                  Explore performance
                </Button>
              </div>
            ) : null}
            {scene.id === "finalLaunch" ? (
              <div className="scene-actions">
                <Button onClick={onTestDrive}>Request a test drive</Button>
                <Button variant="ghost" onClick={onReplay}>
                  Replay experience
                </Button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
