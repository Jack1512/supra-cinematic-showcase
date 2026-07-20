export type SceneId =
  | "hero"
  | "exterior"
  | "aerodynamics"
  | "performance"
  | "cockpitTransition"
  | "cockpit"
  | "rearPresence"
  | "finalLaunch";

export type CanvasBreakpoint = "wide" | "desktop" | "tablet" | "mobile";

export type CanvasFit = "cover" | "contain";

export type CanvasPosition = {
  x: number;
  y: number;
  fit?: CanvasFit;
};

export type SceneMetric = {
  value: string;
  label: string;
  sublabel?: string;
};

export type SceneDefinition = {
  id: SceneId;
  label: string;
  navLabel: string;
  start: number;
  end: number;
  representativeFrame: number;
  eyebrow: string;
  heading: string;
  body?: string;
  modelLine?: string;
  secondaryLines?: string[];
  features?: string[];
  metrics?: SceneMetric[];
  secondaryMetricLine?: string;
  primaryCta?: string;
  secondaryCta?: string;
  position: Record<CanvasBreakpoint, CanvasPosition>;
};

export type SequenceProgress = {
  frame: number;
  progress: number;
  scene: SceneId;
  sceneProgress: number;
};
