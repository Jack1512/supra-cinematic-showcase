import { cn } from "@/lib/utils";

export function FormMessage({ id, children, tone = "error" }: { id?: string; children?: string; tone?: "error" | "muted" }) {
  if (!children) {
    return null;
  }

  return (
    <p
      id={id}
      className={cn(
        "mt-2 text-xs leading-5",
        tone === "error" ? "text-red-300" : "text-zinc-400",
      )}
    >
      {children}
    </p>
  );
}
