"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "gr-supra-reduced-motion";
const STORAGE_EVENT = "gr-supra-reduced-motion-change";

export function useReducedMotionPreference() {
  const prefersReducedMotion = useSyncExternalStore(subscribeSystemPreference, getSystemPreference, () => false);
  const storedPreference = useSyncExternalStore(subscribeStoredPreference, getStoredPreference, () => null);
  const userPreference =
    storedPreference === "true" ? true : storedPreference === "false" ? false : null;
  const reducedMotion = userPreference ?? prefersReducedMotion;

  const setReducedMotion = useCallback((value: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, String(value));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  return {
    reducedMotion,
    systemPrefersReducedMotion: prefersReducedMotion,
    userPreference,
    setReducedMotion,
  };
}

function getSystemPreference() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeSystemPreference(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getStoredPreference() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

function subscribeStoredPreference(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}
