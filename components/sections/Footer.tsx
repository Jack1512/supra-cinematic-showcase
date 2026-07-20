"use client";

import type { SceneId } from "@/types/cinematic";

type FooterProps = {
  onNavigateScene: (sceneId: SceneId) => void;
  onTestDrive: () => void;
};

export function Footer({ onNavigateScene, onTestDrive }: FooterProps) {
  return (
    <footer className="site-footer">
      <div>
        <strong>GR SUPRA CONCEPT</strong>
        <p>DRIVEN BY DESIGN. ENGINEERED FOR INTERACTION.</p>
        <small>Unofficial portfolio project. Not affiliated with Toyota.</small>
      </div>
      <nav aria-label="Footer">
        <button onClick={() => onNavigateScene("hero")}>Overview</button>
        <button onClick={() => onNavigateScene("exterior")}>Design</button>
        <button onClick={() => onNavigateScene("aerodynamics")}>Aerodynamics</button>
        <button onClick={() => onNavigateScene("performance")}>Performance</button>
        <button onClick={() => onNavigateScene("cockpit")}>Cockpit</button>
        <button onClick={onTestDrive}>Test Drive</button>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
      <p className="copyright">(c) 2026 Interactive Automotive Portfolio Concept</p>
    </footer>
  );
}
