"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import type { SceneId } from "@/types/cinematic";

type MobileMenuProps = {
  open: boolean;
  activeScene: SceneId;
  onClose: () => void;
  onNavigateScene: (sceneId: SceneId) => void;
  onTestDrive: () => void;
};

export function MobileMenu({ activeScene, onClose, onNavigateScene, onTestDrive, open }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActive = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousActive?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="mobile-menu-shell" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <button className="mobile-menu-backdrop" aria-label="Close menu" onClick={onClose} />
      <div ref={panelRef} className="mobile-menu-panel">
        <div className="mobile-menu-top">
          <span>GR SUPRA</span>
          <button ref={closeRef} className="icon-button" aria-label="Close menu" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.label}
              className={item.sceneId === activeScene ? "is-active" : ""}
              onClick={() => {
                if (item.sceneId) {
                  onNavigateScene(item.sceneId);
                } else {
                  onTestDrive();
                }
                onClose();
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <Button
          className="w-full"
          onClick={() => {
            onTestDrive();
            onClose();
          }}
        >
          Test Drive
        </Button>
      </div>
    </div>
  );
}
