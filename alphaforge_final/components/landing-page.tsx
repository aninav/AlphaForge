"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { GradientText } from "@/components/ui/gradient-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

// Staggered reveal helper
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// Corner bracket marks
function CornerMarks() {
  const corners = [
    "top-5 left-5 border-t border-l",
    "top-5 right-5 border-t border-r",
    "bottom-5 left-5 border-b border-l",
    "bottom-5 right-5 border-b border-r",
  ];
  return (
    <>
      {corners.map((c, i) => (
        <span
          key={i}
          className={`absolute w-4 h-4 border-forge-dim opacity-30 pointer-events-none ${c}`}
        />
      ))}
    </>
  );
}

// Bottom status strip
function StatusStrip() {
  const items = [
    { label: "Regime",  value: "Trending", color: "text-forge-pos" },
    { label: "Signal",  value: "Long",     color: "text-forge-pos" },
    { label: "Vol pct", value: "34%",      color: "text-forge-mid" },
    { label: "Sharpe",  value: "1.42",     color: "text-forge-mid" },
    { label: "Mode",    value: "Backtest", color: "text-forge-mid" },
  ];
  return (
    <motion.div
      className="absolute bottom-7 left-0 right-0 flex justify-center gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
    >
      {items.map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <span className="font-mono text-[8px] tracking-[0.28em] uppercase text-forge-muted">
            {label}
          </span>
          <span className={`font-mono text-[10px] tracking-wider ${color}`}>
            {value}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-forge-bg flex items-center justify-center overflow-hidden">
      {/* animated paths */}
      <BackgroundPaths />

      {/* corner brackets */}
      <CornerMarks />

      {/* fine horizontal rule across full width — architectural detail */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-forge-border opacity-20 pointer-events-none" />

      {/* hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* eyebrow */}
        <Reveal delay={0.1}>
          <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-forge-muted mb-8">
            v2.1 &nbsp;·&nbsp; systematic research
          </p>
        </Reveal>

        {/* title — GradientText only here */}
        <GradientText
          as="h1"
          className="font-serif text-[clamp(64px,12vw,104px)] font-extrabold leading-none tracking-[-0.03em] mb-0"
        >
          AlphaForge
        </GradientText>

        {/* rule */}
        <Reveal delay={0.55}>
          <div className="w-10 h-px bg-forge-dim mx-auto my-7" />
        </Reveal>

        {/* subtitle */}
        <Reveal delay={0.65}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-forge-mid mb-3">
            Systematic Strategy Research Terminal
          </p>
        </Reveal>

        {/* tagline */}
        <Reveal delay={0.75}>
          <p className="font-mono text-[12px] text-forge-subtle leading-relaxed max-w-sm mb-12">
            Research market regimes, test strategies,
            <br />
            and analyse event-driven volatility.
          </p>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.9}>
          <InteractiveHoverButton
            text="Enter Terminal"
            onClick={() => router.push("/terminal")}
          />
        </Reveal>
      </div>

      {/* status strip */}
      <StatusStrip />
    </div>
  );
}
