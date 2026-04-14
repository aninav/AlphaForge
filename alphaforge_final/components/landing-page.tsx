"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { GradientText } from "@/components/ui/gradient-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Theme } from "@/components/ui/theme";
import { useAuth } from "@/components/auth-provider";

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
    </motion.div>
  );
}

function CornerMarks() {
  const corners = ["top-5 left-5 border-t border-l","top-5 right-5 border-t border-r","bottom-5 left-5 border-b border-l","bottom-5 right-5 border-b border-r"];
  return <>{corners.map((c, i) => <span key={i} className={`absolute w-4 h-4 border-forge-dim opacity-30 pointer-events-none ${c}`} />)}</>;
}

function StatusStrip() {
  const items = [
    { label: "Regime",  value: "Trending", color: "text-forge-pos" },
    { label: "Signal",  value: "Long",     color: "text-forge-pos" },
    { label: "Vol pct", value: "34%",      color: "text-forge-accent" },
    { label: "Sharpe",  value: "1.42",     color: "text-forge-accent" },
    { label: "Mode",    value: "Backtest", color: "text-forge-accent" },
  ];
  return (
    <motion.div className="absolute bottom-7 left-0 right-0 flex justify-center gap-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}>
      {items.map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <span className="font-mono text-[8px] tracking-[0.28em] uppercase text-forge-label">{label}</span>
          <span className={`font-mono text-[10px] tracking-wider ${color}`}>{value}</span>
        </div>
      ))}
    </motion.div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  return (
    <div className="relative min-h-screen w-full bg-forge-bg flex items-center justify-center overflow-hidden">
      <BackgroundPaths />
      <CornerMarks />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-forge-border opacity-20 pointer-events-none" />

      {/* Top bar */}
      <motion.div className="absolute top-5 left-0 right-0 z-20 px-6 flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Theme variant="dropdown" size="sm" showLabel />
        {!loading && user && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] tracking-[0.2em] text-forge-label truncate max-w-[160px]">{user.email}</span>
            <button onClick={signOut} className="font-mono text-[9px] tracking-[0.25em] uppercase text-forge-body hover:text-forge-text border border-forge-dim hover:border-forge-muted px-2.5 py-1 transition-colors duration-200">
              Log out
            </button>
          </div>
        )}
      </motion.div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <Reveal delay={0.1}>
          <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-forge-label mb-8">v2.1 &nbsp;·&nbsp; systematic research</p>
        </Reveal>

        <GradientText as="h1" className="font-serif text-[clamp(64px,12vw,104px)] font-extrabold leading-none tracking-[-0.03em] mb-0">
          AlphaForge
        </GradientText>

        <Reveal delay={0.55}>
          <div className="w-10 h-px bg-forge-dim mx-auto my-7" />
        </Reveal>

        <Reveal delay={0.65}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-forge-body mb-3">Systematic Strategy Research Terminal</p>
        </Reveal>

        <Reveal delay={0.75}>
          <p className="font-mono text-[12px] text-forge-body leading-relaxed max-w-sm mb-12">
            Research market regimes, test strategies,<br />and analyse event-driven volatility.
          </p>
        </Reveal>

        <Reveal delay={0.9}>
          {loading ? (
            <div className="h-10 w-36 bg-forge-surface border border-forge-dim animate-pulse" />
          ) : (
            <InteractiveHoverButton
              text={user ? "Enter Terminal" : "Get Started"}
              onClick={() => router.push(user ? "/terminal" : "/auth")}
            />
          )}
        </Reveal>
      </div>

      <StatusStrip />
    </div>
  );
}
