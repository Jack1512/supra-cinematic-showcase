import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "min-h-12 w-full border border-white/[0.14] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-red-500 focus:bg-zinc-900",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
