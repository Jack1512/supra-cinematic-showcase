import { describe, expect, it } from "vitest";
import {
  buildFrameLoadPlan,
  frameToProgress,
  getFrameUrl,
  progressToFrame,
  scrollYToFrame,
  frameToScrollY,
} from "@/lib/frames";

describe("frame utilities", () => {
  it("generates padded public frame URLs", () => {
    expect(getFrameUrl(1)).toBe("/frames-hq/frame_0001.jpg");
    expect(getFrameUrl(264)).toBe("/frames-hq/frame_0264.jpg");
  });

  it("maps global progress to frames", () => {
    expect(progressToFrame(0)).toBe(1);
    expect(progressToFrame(1)).toBe(264);
    expect(progressToFrame(-1)).toBe(1);
    expect(progressToFrame(2)).toBe(264);
  });

  it("maps frames back to progress", () => {
    expect(frameToProgress(1)).toBe(0);
    expect(frameToProgress(264)).toBe(1);
    expect(frameToProgress(132)).toBeCloseTo((132 - 1) / 263);
  });

  it("maps scroll offsets to frames and back", () => {
    const scrollY = frameToScrollY(132, 1000, 5000);
    expect(scrollYToFrame(scrollY, 1000, 5000)).toBe(132);
  });

  it("builds staged loading plan without duplicate critical frames", () => {
    const plan = buildFrameLoadPlan();
    expect(plan.critical).toHaveLength(24);
    expect(plan.anchors).toContain(1);
    expect(plan.anchors).toContain(264);
    expect(new Set([...plan.critical, ...plan.anchors, ...plan.sparse, ...plan.remaining]).size).toBe(264);
  });
});
