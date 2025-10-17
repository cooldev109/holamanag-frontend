import * as React from "react";
import { cn } from "@/lib/utils";

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-card transition-all duration-300 hover:shadow-card-hover hover:bg-white/15",
      "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
      className
    )}
    {...props}
  />
));
GlassCard.displayName = "GlassCard";

export { GlassCard };