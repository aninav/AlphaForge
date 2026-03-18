"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Enter Terminal", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // base
        "group relative overflow-hidden cursor-pointer",
        "w-52 h-12 rounded-none",
        "border border-forge-dim",
        "bg-transparent",
        "font-mono text-[10px] tracking-[0.22em] uppercase",
        "text-forge-text",
        "transition-colors duration-300",
        className
      )}
      {...props}
    >
      {/* sliding background fill */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 z-0",
          "bg-forge-bright",
          "translate-x-[-101%] group-hover:translate-x-0",
          "transition-transform duration-[380ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        )}
      />

      {/* default label — slides out on hover */}
      <span
        className={cn(
          "relative z-10 inline-block",
          "transition-all duration-300",
          "group-hover:translate-x-12 group-hover:opacity-0"
        )}
      >
        {text}
      </span>

      {/* hover label + arrow — slides in */}
      <div
        className={cn(
          "absolute inset-0 z-10",
          "flex items-center justify-center gap-2",
          "translate-x-12 opacity-0",
          "group-hover:translate-x-0 group-hover:opacity-100",
          "transition-all duration-300",
          "text-forge-bg font-mono text-[10px] tracking-[0.22em] uppercase"
        )}
      >
        <span>{text}</span>
        <ArrowRight size={13} strokeWidth={1.5} />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
export { InteractiveHoverButton };
