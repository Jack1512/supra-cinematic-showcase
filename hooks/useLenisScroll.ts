"use client";

import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useLenisScroll(disabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (disabled) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.12,
      easing: (time) => Math.min(1, 1.001 - 2 ** (-10 * time)),
      wheelMultiplier: 0.68,
      touchMultiplier: 1,
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [disabled]);

  const scrollTo = useCallback((target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean }) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, {
        offset: options?.offset,
        immediate: options?.immediate,
      });
      return;
    }

    if (typeof target === "number") {
      window.scrollTo({
        top: target + (options?.offset || 0),
        behavior: options?.immediate ? "auto" : "smooth",
      });
      return;
    }

    if (typeof target === "string") {
      const element = document.querySelector<HTMLElement>(target);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY + (options?.offset || 0);
        window.scrollTo({ top, behavior: options?.immediate ? "auto" : "smooth" });
      }
      return;
    }

    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY + (options?.offset || 0),
      behavior: options?.immediate ? "auto" : "smooth",
    });
  }, []);

  return {
    scrollTo,
  };
}
