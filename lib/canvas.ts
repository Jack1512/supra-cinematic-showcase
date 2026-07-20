import type { CanvasFit, CanvasPosition } from "@/types/cinematic";

export type CanvasDrawRect = {
  sourceWidth: number;
  sourceHeight: number;
  destinationX: number;
  destinationY: number;
  destinationWidth: number;
  destinationHeight: number;
};

export function getDevicePixelRatioCap(value: number | undefined, cap = 2) {
  return Math.min(value || 1, cap);
}

export function getCoverDrawRect(
  sourceWidth: number,
  sourceHeight: number,
  destinationWidth: number,
  destinationHeight: number,
  position: CanvasPosition = { x: 0.5, y: 0.5, fit: "cover" },
): CanvasDrawRect {
  const fit: CanvasFit = position.fit || "cover";
  const scale =
    fit === "contain"
      ? Math.min(destinationWidth / sourceWidth, destinationHeight / sourceHeight)
      : Math.max(destinationWidth / sourceWidth, destinationHeight / sourceHeight);
  const scaledWidth = sourceWidth * scale;
  const scaledHeight = sourceHeight * scale;

  return {
    sourceWidth: scaledWidth,
    sourceHeight: scaledHeight,
    destinationX: (destinationWidth - scaledWidth) * position.x,
    destinationY: (destinationHeight - scaledHeight) * position.y,
    destinationWidth: scaledWidth,
    destinationHeight: scaledHeight,
  };
}

export function resolveCanvasBreakpoint(width: number) {
  if (width >= 1680) {
    return "wide" as const;
  }

  if (width >= 1024) {
    return "desktop" as const;
  }

  if (width >= 640) {
    return "tablet" as const;
  }

  return "mobile" as const;
}
