"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  /** "outline" (default) = transparent with border; "solid" = filled accent, high emphasis. */
  variant?: "outline" | "solid";
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Enter Terminal", variant = "outline", className, ...props }, ref) => {
  const isSolid = variant === "solid";

  return (
    <button
      ref={ref}
      className={cn(
        // base
        "group relative overflow-hidden cursor-pointer",
        "w-52 h-12 rounded-none",
        "font-mono text-[10px] tracking-[0.22em] uppercase",
        "transition-colors duration-300",
        // variant base
        isSolid
          ? "border border-forge-accent bg-forge-accent text-forge-bg"
          : "border border-forge-dim bg-transparent text-forge-text",
        className
      )}
      {...props}
    >
      {/* sliding background fill */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 z-0",
          isSolid ? "bg-forge-bright" : "bg-forge-bright",
          "translate-x-[-101%] group-hover:translate-x-0",
          "transition-transform duration-[380ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        )}
      />

      {/* default label — slides out on hover */}
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-2 w-full h-full",
          "transition-all duration-300",
          "group-hover:translate-x-12 group-hover:opacity-0"
        )}
      >
        {text}
        {isSolid && <ArrowRight size={14} strokeWidth={1.75} />}
      </span>

      {/* hover label + arrow — slides in */}
      <div
        className={cn(
          "absolute inset-0 z-10",
          "flex items-center justify-center gap-2",
          "translate-x-12 opacity-0",
          "group-hover:translate-x-0 group-hover:opacity-100",
          "transition-all duration-300",
          "text-forge-bg font-mono tracking-[0.22em] uppercase"
        )}
      >
        <span>{text}</span>
        <ArrowRight size={14} strokeWidth={1.75} />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
export { InteractiveHoverButton };
