"use client";

import React from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

export function GradientText({
  className,
  children,
  as: Component = "span",
  ...props
}: GradientTextProps) {
  // framer-motion wraps any HTML element
  const MotionComponent = motion.create(Component as keyof React.JSX.IntrinsicElements);

  return (
    <MotionComponent
      className={cn(
        "relative inline-block",
        "bg-gradient-to-br from-forge-bright via-forge-text to-forge-subtle",
        "bg-clip-text text-transparent",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
