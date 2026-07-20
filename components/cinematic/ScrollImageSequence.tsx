"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { FrameDebugPanel } from "@/components/cinematic/FrameDebugPanel";
import { SceneOverlay } from "@/components/cinematic/SceneOverlay";
import { SequenceCanvas } from "@/components/cinematic/SequenceCanvas";
import { SequencePreloader } from "@/components/cinematic/SequencePreloader";
import { SCENE_BY_ID, SCROLL_LENGTH_VH, TOTAL_FRAMES } from "@/config/scenes";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { getCoverDrawRect, getDevicePixelRatioCap, resolveCanvasBreakpoint } from "@/lib/canvas";
import { frameToProgress, frameToScrollY, progressToFrame } from "@/lib/frames";
import { getActiveScene, getSceneProgress } from "@/lib/scene-progress";
import type { SceneId, SequenceProgress } from "@/types/cinematic";

gsap.registerPlugin(ScrollTrigger);

export type SequenceController = {
  scrollToFrame: (frame: number, immediate?: boolean) => void;
  scrollToScene: (sceneId: SceneId) => void;
  scrollToStart: () => void;
  replay: () => void;
  getCurrentFrame: () => number;
};

type ScrollImageSequenceProps = {
  onControllerReady: (controller: SequenceController | null) => void;
  onProgressChange: (sequence: SequenceProgress) => void;
  onFallbackRequest: () => void;
  onTestDrive: () => void;
  scrollToY: (target: number, options?: { immediate?: boolean }) => void;
};

const INITIAL_SEQUENCE: SequenceProgress = {
  frame: 1,
  progress: 0,
  scene: "hero",
  sceneProgress: 0,
};

export function ScrollImageSequence({
  onControllerReady,
  onFallbackRequest,
  onProgressChange,
  onTestDrive,
  scrollToY,
}: ScrollImageSequenceProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const renderLoopActiveRef = useRef(false);
  const tickRenderedFrameRef = useRef<() => void>(() => undefined);
  const targetFrameRef = useRef(1);
  const renderedFloatRef = useRef(1);
  const renderedFrameRef = useRef(1);
  const lastDrawSignatureRef = useRef("");
  const lastProgressRef = useRef<SequenceProgress>(INITIAL_SEQUENCE);
  const [sequence, setSequence] = useState<SequenceProgress>(INITIAL_SEQUENCE);
  const [canvasUnsupported, setCanvasUnsupported] = useState(false);
  const preloader = useFramePreloader(true);
  const { ensureFrameWindow, getNearestLoadedImage } = preloader;

  const scrollToFrame = useCallback(
    (frame: number, immediate = false) => {
      const trigger = triggerRef.current;
      const targetY = trigger
        ? frameToScrollY(frame, trigger.start, trigger.end)
        : frameToScrollY(frame, 0, document.documentElement.scrollHeight - window.innerHeight);
      scrollToY(targetY, { immediate });
    },
    [scrollToY],
  );

  const scrollToScene = useCallback(
    (sceneId: SceneId) => {
      scrollToFrame(SCENE_BY_ID[sceneId].start);
    },
    [scrollToFrame],
  );

  const emitSequence = useCallback(
    (progress: number) => {
      const frame = progressToFrame(progress);
      const scene = getActiveScene(frame);
      const next: SequenceProgress = {
        frame,
        progress,
        scene: scene.id,
        sceneProgress: getSceneProgress(frame, scene),
      };
      const previous = lastProgressRef.current;

      if (
        previous.frame !== next.frame ||
        previous.scene !== next.scene ||
        Math.abs(previous.progress - next.progress) > 0.004
      ) {
        lastProgressRef.current = next;
        setSequence(next);
        onProgressChange(next);
      }
    },
    [onProgressChange],
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      setCanvasUnsupported(true);
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = getDevicePixelRatioCap(window.devicePixelRatio, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    lastDrawSignatureRef.current = "";
  }, []);

  const drawFallbackFrame = useCallback((context: CanvasRenderingContext2D, width: number, height: number) => {
    context.fillStyle = "#050505";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#D71920";
    context.fillRect(width * 0.08, height * 0.62, width * 0.32, 2);
    context.fillStyle = "#F4F4F2";
    context.font = "12px sans-serif";
    context.fillText("FRAME ASSETS PENDING", width * 0.08, height * 0.62 - 18);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      setCanvasUnsupported(true);
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const frame = renderedFrameRef.current;
    const loaded = getNearestLoadedImage(frame);
    const scene = getActiveScene(targetFrameRef.current);
    const breakpoint = resolveCanvasBreakpoint(width);
    const position = scene.position[breakpoint];
    const signature = `${loaded?.frame || "none"}-${width}-${height}-${breakpoint}-${position.x}-${position.y}-${position.fit || "cover"}`;

    if (signature === lastDrawSignatureRef.current) {
      return;
    }

    lastDrawSignatureRef.current = signature;
    context.fillStyle = "#050505";
    context.fillRect(0, 0, width, height);

    if (!loaded) {
      drawFallbackFrame(context, width, height);
      return;
    }

    const image = loaded.image;
    const rect = getCoverDrawRect(image.naturalWidth, image.naturalHeight, width, height, position);
    context.drawImage(image, rect.destinationX, rect.destinationY, rect.destinationWidth, rect.destinationHeight);
  }, [drawFallbackFrame, getNearestLoadedImage]);

  const scheduleDraw = useCallback(() => {
    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(() => {
    tickRenderedFrameRef.current = () => {
      const current = renderedFloatRef.current;
      const target = targetFrameRef.current;
      const delta = target - current;
      const next = Math.abs(delta) < 0.08 ? target : current + delta * 0.3;
      renderedFloatRef.current = next;

      const rounded = progressToFrame(frameToProgress(next));
      if (rounded !== renderedFrameRef.current) {
        renderedFrameRef.current = rounded;
        ensureFrameWindow(rounded);
        scheduleDraw();
      }

      if (Math.abs(target - next) > 0.08) {
        window.requestAnimationFrame(() => tickRenderedFrameRef.current());
      } else {
        renderLoopActiveRef.current = false;
      }
    };
  }, [ensureFrameWindow, scheduleDraw]);

  const startRenderLoop = useCallback(() => {
    if (renderLoopActiveRef.current) {
      return;
    }

    renderLoopActiveRef.current = true;
    window.requestAnimationFrame(() => tickRenderedFrameRef.current());
  }, []);

  const setScrollProgress = useCallback(
    (progress: number) => {
      const clamped = Math.min(Math.max(progress, 0), 1);
      targetFrameRef.current = progressToFrame(clamped, TOTAL_FRAMES);
      ensureFrameWindow(targetFrameRef.current);
      emitSequence(clamped);
      startRenderLoop();
    },
    [emitSequence, ensureFrameWindow, startRenderLoop],
  );

  const replay = useCallback(() => {
    targetFrameRef.current = 1;
    renderedFloatRef.current = 1;
    renderedFrameRef.current = 1;
    setScrollProgress(0);
    scrollToFrame(1);
  }, [scrollToFrame, setScrollProgress]);

  useEffect(() => {
    resizeCanvas();
    scheduleDraw();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    return () => {
      renderLoopActiveRef.current = false;
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [resizeCanvas, scheduleDraw]);

  useEffect(() => {
    scheduleDraw();
  }, [preloader.version, scheduleDraw]);

  useEffect(() => {
    if (!sectionRef.current || canvasUnsupported) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      pin: stageRef.current,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * (SCROLL_LENGTH_VH / 100))}`,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => setScrollProgress(self.progress),
    });

    triggerRef.current = trigger;
    setScrollProgress(0);
    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      triggerRef.current = null;
    };
  }, [canvasUnsupported, setScrollProgress]);

  useEffect(() => {
    const shouldLock = !preloader.isCriticalReady && !preloader.hasCriticalFailure;
    const previous = document.body.style.overflow;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previous;
    };
  }, [preloader.hasCriticalFailure, preloader.isCriticalReady]);

  useEffect(() => {
    if (preloader.isCriticalReady) {
      ScrollTrigger.refresh();
    }
  }, [preloader.isCriticalReady]);

  useEffect(() => {
    const controller: SequenceController = {
      scrollToFrame,
      scrollToScene,
      scrollToStart: () => scrollToFrame(1),
      replay,
      getCurrentFrame: () => targetFrameRef.current,
    };

    onControllerReady(controller);
    return () => onControllerReady(null);
  }, [onControllerReady, replay, scrollToFrame, scrollToScene]);

  if (canvasUnsupported) {
    return (
      <section className="canvas-fallback" aria-label="Static Toyota GR Supra concept fallback">
        <div>
          <p className="micro-label">GR Supra concept</p>
          <h1>GR SUPRA</h1>
          <p>
            The scroll-controlled canvas is not supported in this browser. All written scenes,
            configuration controls and the enquiry form remain available.
          </p>
          <Button onClick={onFallbackRequest}>Use static experience</Button>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="cinematic-section" aria-label="Cinematic Toyota GR Supra Mk5 concept">
      <div ref={stageRef} className="cinematic-stage">
        <SequenceCanvas ref={canvasRef} />
        <div className="canvas-vignette" aria-hidden="true" />
        <SceneOverlay
          sequence={sequence}
          onBegin={() => scrollToFrame(22)}
          onPerformance={() => scrollToScene("performance")}
          onReplay={replay}
          onTestDrive={onTestDrive}
        />
        <FrameDebugPanel sequence={sequence} />
        <SequencePreloader
          loaded={preloader.criticalLoaded}
          total={preloader.criticalTotal}
          ready={preloader.isCriticalReady}
          failed={preloader.hasCriticalFailure}
          onRetry={preloader.retryCritical}
          onUseFallback={onFallbackRequest}
        />
      </div>
    </section>
  );
}
