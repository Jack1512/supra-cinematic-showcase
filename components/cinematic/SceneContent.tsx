"use client";

import { Button } from "@/components/ui/Button";
import type { SceneDefinition } from "@/types/cinematic";

type SceneContentProps = {
  scene: SceneDefinition;
  sceneProgress: number;
  onBegin: () => void;
  onPerformance: () => void;
  onTestDrive: () => void;
  onReplay: () => void;
};

function stagedOpacity(sceneProgress: number, index: number, total: number) {
  const start = 0.12 + index * (0.55 / Math.max(total, 1));
  return sceneProgress >= start ? 1 : 0.22;
}

export function SceneContent({
  scene,
  sceneProgress,
  onBegin,
  onPerformance,
  onTestDrive,
  onReplay,
}: SceneContentProps) {
  const activeFeatureIndex = scene.features
    ? Math.min(scene.features.length - 1, Math.floor(sceneProgress * scene.features.length))
    : 0;

  if (scene.id === "performance") {
    return (
      <div className="scene-copy scene-copy--performance">
        <p className="micro-label">{scene.eyebrow}</p>
        <h2>{scene.heading}</h2>
        <div className="metric-strip">
          {scene.metrics?.map((metric, index) => (
            <div
              key={metric.value}
              className="metric"
              style={{ opacity: stagedOpacity(sceneProgress, index, scene.metrics?.length || 1) }}
            >
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              {metric.sublabel ? <small>{metric.sublabel}</small> : null}
            </div>
          ))}
        </div>
        {scene.secondaryMetricLine ? <p className="scene-note">{scene.secondaryMetricLine}</p> : null}
      </div>
    );
  }

  if (scene.id === "cockpitTransition") {
    return (
      <div className="scene-copy scene-copy--center">
        <p className="micro-label">{scene.eyebrow}</p>
        <h2>{scene.heading}</h2>
        <div className="stacked-lines">
          {scene.secondaryLines?.map((line, index) => (
            <span key={line} style={{ opacity: stagedOpacity(sceneProgress, index, scene.secondaryLines?.length || 1) }}>
              {line}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (scene.id === "finalLaunch") {
    return (
      <div className="scene-copy scene-copy--final">
        <p className="micro-label">{scene.eyebrow}</p>
        <h2>{scene.heading}</h2>
        {scene.body ? <p>{scene.body}</p> : null}
        <div className="scene-actions">
          <Button onClick={onTestDrive}>{scene.primaryCta}</Button>
          <Button variant="ghost" onClick={onReplay}>
            {scene.secondaryCta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`scene-copy scene-copy--${scene.id}`}>
      <p className="micro-label">{scene.eyebrow}</p>
      <h2>{scene.heading}</h2>
      {scene.body ? <p>{scene.body}</p> : null}
      {scene.modelLine ? <p className="model-line">{scene.modelLine}</p> : null}
      {scene.features ? (
        <div className="feature-labels" aria-label={`${scene.label} feature callouts`}>
          {scene.features.map((feature, index) => (
            <span key={feature} className={index === activeFeatureIndex ? "is-active" : ""}>
              {feature}
            </span>
          ))}
        </div>
      ) : null}
      {scene.id === "hero" ? (
        <>
          <div className="scene-actions">
            <Button onClick={onBegin}>{scene.primaryCta}</Button>
            <Button variant="ghost" onClick={onPerformance}>
              {scene.secondaryCta}
            </Button>
          </div>
          <p className="scroll-cue">Scroll to awaken</p>
        </>
      ) : null}
    </div>
  );
}
