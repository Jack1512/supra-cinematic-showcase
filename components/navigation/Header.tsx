"use client";

import { useEffect, useState } from "react";
import { Menu, Gauge, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { CinematicProgress } from "@/components/cinematic/CinematicProgress";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import type { SceneId } from "@/types/cinematic";

type HeaderProps = {
  activeScene: SceneId;
  progress: number;
  reducedMotion: boolean;
  onNavigateScene: (sceneId: SceneId) => void;
  onTestDrive: () => void;
  soundEnabled: boolean;
  soundSupported: boolean;
  onToggleSound: () => void;
  onToggleReducedMotion: () => void;
};

export function Header({
  activeScene,
  progress,
  reducedMotion,
  onNavigateScene,
  onTestDrive,
  soundEnabled,
  soundSupported,
  onToggleSound,
  onToggleReducedMotion,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <a className="brand-mark" href="#main" aria-label="GR Supra concept home">
          <span>GR</span>
          SUPRA
        </a>
        <nav className="desktop-nav" aria-label="Primary">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.label}
              className={item.sceneId === activeScene ? "is-active" : ""}
              onClick={() => (item.sceneId ? onNavigateScene(item.sceneId) : onTestDrive())}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="header-controls">
          <CinematicProgress progress={progress} />
          <button
            className="icon-button"
            aria-label={reducedMotion ? "Enable cinematic motion" : "Reduce motion"}
            title={reducedMotion ? "Enable cinematic motion" : "Reduce motion"}
            onClick={onToggleReducedMotion}
          >
            {reducedMotion ? <RotateCcw size={18} aria-hidden="true" /> : <Gauge size={18} aria-hidden="true" />}
          </button>
          <button
            className="icon-button"
            aria-label={
              soundSupported
                ? soundEnabled
                  ? "Mute concept sound"
                  : "Play concept sound"
                : "Sound unavailable in this browser"
            }
            title={
              soundSupported
                ? soundEnabled
                  ? "Mute concept sound"
                  : "Play concept sound"
                : "Sound unavailable in this browser"
            }
            onClick={onToggleSound}
            disabled={!soundSupported}
          >
            {soundEnabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
          </button>
          <button className="icon-button menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </header>
      <MobileMenu
        open={menuOpen}
        activeScene={activeScene}
        onClose={() => setMenuOpen(false)}
        onNavigateScene={onNavigateScene}
        onTestDrive={onTestDrive}
      />
    </>
  );
}
