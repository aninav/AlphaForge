"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GradientTextProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export function GradientText<T extends React.ElementType = "span">({
  as,
  className,
  children,
  ...props
}: GradientTextProps<T>) {
  const Component = as || "span";

  return (
    <motion.span
      as={Component as any}
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