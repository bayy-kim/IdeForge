import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-lg border border-line bg-ink-raised-2 px-4 py-3 text-[15px] text-paper placeholder:text-muted/70 focus-visible:outline-none focus-visible:border-signal/60 focus-visible:ring-1 focus-visible:ring-signal/40 transition-colors resize-none disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
