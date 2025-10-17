import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: "h1" | "h2" | "h3";
  size?: "sm" | "md" | "lg" | "xl";
}

const SectionTitle = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(
  ({ className, level = "h2", size = "lg", children, ...props }, ref) => {
    const Component = level;
    
    const sizeClasses = {
      sm: "text-2xl md:text-3xl",
      md: "text-3xl md:text-4xl",
      lg: "text-4xl md:text-5xl lg:text-6xl",
      xl: "text-5xl md:text-6xl lg:text-7xl",
    };

    return (
      <Component
        ref={ref}
        className={cn(
          "font-heading font-bold tracking-tight text-foreground",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
SectionTitle.displayName = "SectionTitle";

export { SectionTitle };