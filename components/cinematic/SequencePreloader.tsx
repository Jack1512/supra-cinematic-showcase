"use client";

import { Button } from "@/components/ui/Button";

type SequencePreloaderProps = {
  loaded: number;
  total: number;
  ready: boolean;
  failed: boolean;
  onRetry: () => void;
  onUseFallback: () => void;
};

export function SequencePreloader({
  loaded,
  total,
  ready,
  failed,
  onRetry,
  onUseFallback,
}: SequencePreloaderProps) {
  const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;

  return (
    <div className={`sequence-preloader ${ready ? "sequence-preloader--ready" : ""}`} aria-live="polite">
      <div className="preloader-inner">
        <p className="micro-label text-red-400">GR PERFORMANCE CONCEPT</p>
        <h1>Preparing the machine</h1>
        <div className="preloader-meter" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.min(percentage, 100) / 100})` }} />
        </div>
        <p className="preloader-status">
          {failed
            ? "The critical frame sequence could not be loaded."
            : ready
              ? "Ready"
              : `${percentage}% critical frames loaded`}
        </p>
        {failed ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={onRetry}>Retry</Button>
            <Button variant="ghost" onClick={onUseFallback}>
              Static fallback
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
