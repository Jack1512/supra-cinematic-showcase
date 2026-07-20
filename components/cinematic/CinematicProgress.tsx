"use client";

export function CinematicProgress({ progress }: { progress: number }) {
  return (
    <div className="cinematic-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${Math.min(Math.max(progress, 0), 1)})` }} />
    </div>
  );
}
