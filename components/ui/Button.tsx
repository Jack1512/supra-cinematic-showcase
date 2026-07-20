import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-red-500/80 bg-red-600 text-white hover:bg-red-500",
  secondary: "border-white/[0.2] bg-white text-black hover:bg-zinc-200",
  ghost: "border-white/[0.16] bg-transparent text-white hover:border-white/[0.4] hover:bg-white/[0.08]",
  danger: "border-red-500/70 bg-transparent text-red-100 hover:bg-red-500/14",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
