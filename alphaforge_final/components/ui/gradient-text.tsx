"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children: React.ReactNode;
}

export function GradientText({
  className,
  children,
  ...props
}: GradientTextProps) {
  return (
    <motion.span
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
    </motion.span>
  );
}