export const EXTERIOR_FINISHES = [
  "Renaissance Red",
  "Absolute Zero",
  "Nocturnal Black",
  "Stratosphere Blue",
] as const;

export const WHEEL_THEMES = ["Performance Black", "Machined Graphite"] as const;

export const TRANSMISSIONS = ["6-Speed Manual", "8-Speed Automatic"] as const;

export type ExteriorFinish = (typeof EXTERIOR_FINISHES)[number];
export type WheelTheme = (typeof WHEEL_THEMES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];

export type SupraConfiguration = {
  exteriorFinish: ExteriorFinish;
  wheelTheme: WheelTheme;
  transmission: Transmission;
};

export const DEFAULT_CONFIGURATION: SupraConfiguration = {
  exteriorFinish: "Renaissance Red",
  wheelTheme: "Performance Black",
  transmission: "6-Speed Manual",
};
