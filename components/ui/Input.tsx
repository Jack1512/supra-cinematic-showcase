import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "min-h-12 w-full border border-white/[0.14] bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-500 focus:bg-white/[0.07]",
          className,
        )}
        {...props}
      />
    );
  },
);
