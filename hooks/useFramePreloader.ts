"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SCENES, TOTAL_FRAMES } from "@/config/scenes";
import { buildFrameLoadPlan, clampFrame, getFrameUrl } from "@/lib/frames";

type LoadingState = {
  criticalLoaded: number;
  criticalTotal: number;
  overallLoaded: number;
  failedCritical: number[];
  isCriticalReady: boolean;
  hasCriticalFailure: boolean;
  version: number;
};

type LoadOptions = {
  retry?: boolean;
  critical?: boolean;
};

const MAX_RETRIES = 2;

function scheduleIdle(callback: () => void) {
  const browserWindow = window as Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof browserWindow.requestIdleCallback === "function") {
    const handle = browserWindow.requestIdleCallback(callback, { timeout: 1200 });
    return () => browserWindow.cancelIdleCallback?.(handle);
  }

  const timeout = globalThis.setTimeout(callback, 64);
  return () => globalThis.clearTimeout(timeout);
}

export function useFramePreloader(enabled = true) {
  const plan = useMemo(() => buildFrameLoadPlan(TOTAL_FRAMES), []);
  const cacheRef = useRef(new Map<number, HTMLImageElement>());
  const loadingRef = useRef(new Map<number, Promise<HTMLImageElement>>());
  const failedRef = useRef(new Set<number>());
  const retriesRef = useRef(new Map<number, number>());
  const requestedRef = useRef(new Set<number>());
  const cancelledRef = useRef(false);
  const currentFrameRef = useRef(1);
  const protectedFramesRef = useRef(
    new Set<number>([
      ...plan.critical,
      1,
      TOTAL_FRAMES,
      ...SCENES.flatMap((scene) => [scene.start, scene.end, scene.representativeFrame]),
    ]),
  );
  const [state, setState] = useState<LoadingState>({
    criticalLoaded: 0,
    criticalTotal: plan.critical.length,
    overallLoaded: 0,
    failedCritical: [],
    isCriticalReady: false,
    hasCriticalFailure: false,
    version: 0,
  });

  const updateLoadedState = useCallback(
    (frame: number, critical: boolean) => {
      if (cancelledRef.current) {
        return;
      }

      setState((current) => {
        const criticalLoaded = critical ? current.criticalLoaded + 1 : current.criticalLoaded;
        return {
          ...current,
          criticalLoaded,
          overallLoaded: cacheRef.current.size,
          isCriticalReady: criticalLoaded >= current.criticalTotal && current.failedCritical.length === 0,
          version: current.version + 1,
        };
      });
    },
    [],
  );

  const markFailed = useCallback((frame: number, critical: boolean) => {
    if (cancelledRef.current) {
      return;
    }

    failedRef.current.add(frame);
    if (!critical) {
      return;
    }

    setState((current) => {
      const failedCritical = current.failedCritical.includes(frame)
        ? current.failedCritical
        : [...current.failedCritical, frame].sort((a, b) => a - b);

      return {
        ...current,
        failedCritical,
        hasCriticalFailure: true,
        version: current.version + 1,
      };
    });
  }, []);

  const loadFrame = useCallback(
    async (frame: number, options: LoadOptions = {}) => {
      const clamped = clampFrame(frame);
      requestedRef.current.add(clamped);

      const cached = cacheRef.current.get(clamped);
      if (cached) {
        return cached;
      }

      const existing = loadingRef.current.get(clamped);
      if (existing) {
        return existing;
      }

      if (failedRef.current.has(clamped) && !options.retry) {
        throw new Error(`Frame ${clamped} previously failed.`);
      }

      const createAttempt = (attempt: number): Promise<HTMLImageElement> =>
        new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = async () => {
          try {
            if (image.decode) {
              await image.decode();
            }
          } catch {
            // A decoded image can still be drawn after onload in browsers that reject decode late.
          }

          cacheRef.current.set(clamped, image);
          trimFrameCache(currentFrameRef.current, cacheRef.current, protectedFramesRef.current);
          failedRef.current.delete(clamped);
          loadingRef.current.delete(clamped);
          updateLoadedState(clamped, Boolean(options.critical));
          resolve(image);
        };
        image.onerror = () => {
          if (attempt < MAX_RETRIES) {
            retriesRef.current.set(clamped, attempt + 1);
            window.setTimeout(() => {
              createAttempt(attempt + 1).then(resolve).catch(reject);
            }, 180 * (attempt + 1));
            return;
          }

          loadingRef.current.delete(clamped);
          markFailed(clamped, Boolean(options.critical));
          reject(new Error(`Could not load frame ${clamped}.`));
        };
        image.src = getFrameUrl(clamped);
      });

      const promise = createAttempt(retriesRef.current.get(clamped) || 0);

      loadingRef.current.set(clamped, promise);
      return promise;
    },
    [markFailed, updateLoadedState],
  );

  const loadQueue = useCallback(
    (frames: number[]) => {
      const queue = frames.filter((frame) => !cacheRef.current.has(frame) && !loadingRef.current.has(frame));
      let cancelled = false;

      const pump = () => {
        if (cancelled) {
          return;
        }

        const batch = queue.splice(0, 6);
        for (const frame of batch) {
          void loadFrame(frame).catch(() => undefined);
        }

        if (queue.length > 0) {
          scheduleIdle(pump);
        }
      };

      const cancel = scheduleIdle(pump);
      return () => {
        cancelled = true;
        cancel();
      };
    },
    [loadFrame],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    cancelledRef.current = false;
    const criticalLoads = plan.critical.map((frame) =>
      loadFrame(frame, { critical: true }).catch(() => undefined),
    );

    Promise.allSettled(criticalLoads).then(() => {
      if (cancelledRef.current) {
        return;
      }

      setState((current) => ({
        ...current,
        isCriticalReady: current.criticalLoaded >= current.criticalTotal && current.failedCritical.length === 0,
        hasCriticalFailure: current.failedCritical.length > 0,
      }));
    });

    const cancelAnchors = loadQueue(plan.anchors);
    const sparseTimer = window.setTimeout(() => loadQueue(plan.sparse), 400);
    const remainingTimer = window.setTimeout(() => loadQueue(plan.remaining), 1600);

    return () => {
      cancelledRef.current = true;
      cancelAnchors();
      window.clearTimeout(sparseTimer);
      window.clearTimeout(remainingTimer);
    };
  }, [enabled, loadFrame, loadQueue, plan]);

  const retryCritical = useCallback(() => {
    failedRef.current.clear();
    retriesRef.current.clear();
    setState((current) => ({
      ...current,
      criticalLoaded: 0,
      failedCritical: [],
      hasCriticalFailure: false,
      isCriticalReady: false,
      version: current.version + 1,
    }));

    for (const frame of plan.critical) {
      cacheRef.current.delete(frame);
      void loadFrame(frame, { critical: true, retry: true }).catch(() => undefined);
    }
  }, [loadFrame, plan.critical]);

  const getNearestLoadedImage = useCallback((frame: number) => {
    const clamped = clampFrame(frame);
    const direct = cacheRef.current.get(clamped);
    if (direct) {
      return { frame: clamped, image: direct };
    }

    for (let distance = 1; distance < TOTAL_FRAMES; distance += 1) {
      const previous = cacheRef.current.get(clamped - distance);
      if (previous) {
        return { frame: clamped - distance, image: previous };
      }

      const next = cacheRef.current.get(clamped + distance);
      if (next) {
        return { frame: clamped + distance, image: next };
      }
    }

    return null;
  }, []);

  const ensureFrameWindow = useCallback(
    (frame: number) => {
      currentFrameRef.current = clampFrame(frame);
      trimFrameCache(currentFrameRef.current, cacheRef.current, protectedFramesRef.current);
      for (let offset = -2; offset <= 2; offset += 1) {
        const nextFrame = clampFrame(frame + offset);
        if (!cacheRef.current.has(nextFrame) && !loadingRef.current.has(nextFrame)) {
          void loadFrame(nextFrame).catch(() => undefined);
        }
      }
    },
    [loadFrame],
  );

  return {
    ...state,
    cacheRef,
    requestedRef,
    failedRef,
    loadFrame,
    retryCritical,
    getNearestLoadedImage,
    ensureFrameWindow,
  };
}

function getCacheLimit() {
  if (typeof window === "undefined") {
    return 96;
  }

  if (window.innerWidth < 640) {
    return 54;
  }

  if (window.innerWidth < 1024) {
    return 72;
  }

  return 112;
}

function trimFrameCache(
  currentFrame: number,
  cache: Map<number, HTMLImageElement>,
  protectedFrames: Set<number>,
) {
  const limit = getCacheLimit();
  if (cache.size <= limit) {
    return;
  }

  const framesByDistance = [...cache.keys()].sort((a, b) => {
    const aProtected = protectedFrames.has(a);
    const bProtected = protectedFrames.has(b);
    if (aProtected !== bProtected) {
      return aProtected ? 1 : -1;
    }

    return Math.abs(b - currentFrame) - Math.abs(a - currentFrame);
  });

  for (const frame of framesByDistance) {
    if (cache.size <= limit) {
      break;
    }

    if (!protectedFrames.has(frame) || cache.size > protectedFrames.size + 12) {
      cache.delete(frame);
    }
  }
}
