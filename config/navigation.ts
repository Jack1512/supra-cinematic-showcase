import type { SceneId } from "@/types/cinematic";

export type NavigationItem = {
  label: string;
  sceneId?: SceneId;
  target?: "enquiry";
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Overview", sceneId: "hero" },
  { label: "Design", sceneId: "exterior" },
  { label: "Aerodynamics", sceneId: "aerodynamics" },
  { label: "Performance", sceneId: "performance" },
  { label: "Cockpit", sceneId: "cockpit" },
  { label: "Test Drive", target: "enquiry" },
];
