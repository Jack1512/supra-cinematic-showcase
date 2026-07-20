"use client";

import * as React from "react";

type SequenceCanvasProps = React.CanvasHTMLAttributes<HTMLCanvasElement> & {
  label?: string;
};

export const SequenceCanvas = React.forwardRef<HTMLCanvasElement, SequenceCanvasProps>(function SequenceCanvas(
  { label = "Scroll-controlled Toyota GR Supra Mk5 cinematic image sequence.", ...props },
  ref,
) {
  return (
    <canvas
      ref={ref}
      aria-label={label}
      role="img"
      className="sequence-canvas"
      {...props}
    >
      The cinematic image sequence shows an unofficial Toyota GR Supra Mk5 concept reveal,
      including exterior details, aerodynamic motion, cockpit details and a launch sequence.
    </canvas>
  );
});
