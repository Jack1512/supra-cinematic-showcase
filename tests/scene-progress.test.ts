import { describe, expect, it } from "vitest";
import { FRAME_RANGES } from "@/config/scenes";
import { getActiveScene, getNavigationTargetFrame, getSceneProgress } from "@/lib/scene-progress";

describe("scene progress utilities", () => {
  it("returns the active scene for a frame", () => {
    expect(getActiveScene(1).id).toBe("hero");
    expect(getActiveScene(65).id).toBe("exterior");
    expect(getActiveScene(140).id).toBe("performance");
    expect(getActiveScene(176).id).toBe("cockpit");
    expect(getActiveScene(205).id).toBe("rearPresence");
    expect(getActiveScene(264).id).toBe("finalLaunch");
  });

  it("calculates progress within a scene", () => {
    const scene = getActiveScene(46);
    expect(getSceneProgress(46, scene)).toBe(0);
    expect(getSceneProgress(85, scene)).toBe(1);
  });

  it("uses configured scene starts for navigation", () => {
    expect(getNavigationTargetFrame("performance")).toBe(FRAME_RANGES.performance.start);
  });
});
