"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { GradientText } from "@/components/ui/gradient-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Theme } from "@/components/ui/theme";
import { useAuth } from "@/components/auth-provider";

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

function StatusStrip() {
  const items = [
    { label: "Regime",  value: "Trending", color: "text-forge-pos" },
    { label: "Signal",  value: "Long",     color: "text-forge-pos" },
    { label: "Vol pct", value: "34%",      color: "text-forge-accent" },
    { label: "Sharpe",  value: "1.42",     color: "text-forge-accent" },
    { label: "Mode",    value: "Backtest", color: "text-forge-accent" },
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
          <span className="font-mono text-[8px] tracking-[0.28em] uppercase text-forge-label">
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

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LandingPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="relative min-h-screen w-full bg-forge-bg flex items-center justify-center overflow-hidden">
      <BackgroundPaths />
      <CornerMarks />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-forge-border opacity-20 pointer-events-none" />

      {/* Top bar: theme toggle left, auth right */}
      <motion.div
        className="absolute top-5 left-0 right-0 z-20 px-6 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Theme toggle — dropdown variant fits the terminal aesthetic */}
        <Theme variant="dropdown" size="sm" showLabel />

        {/* Auth status */}
        {!loading && user && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] tracking-[0.2em] text-forge-label truncate max-w-[160px]">
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="font-mono text-[9px] tracking-[0.25em] uppercase text-forge-body hover:text-forge-text border border-forge-dim hover:border-forge-muted px-2.5 py-1 transition-colors duration-200"
            >
              Log out
            </button>
          </div>
        )}
      </motion.div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <Reveal delay={0.1}>
          <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-forge-label mb-8">
            v2.1 &nbsp;·&nbsp; systematic research
          </p>
        </Reveal>

        <GradientText
          as="h1"
          className="font-serif text-[clamp(64px,12vw,104px)] font-extrabold leading-none tracking-[-0.03em] mb-0"
        >
          AlphaForge
        </GradientText>

        <Reveal delay={0.55}>
          <div className="w-10 h-px bg-forge-dim mx-auto my-7" />
        </Reveal>

        <Reveal delay={0.65}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-forge-body mb-3">
            Systematic Strategy Research Terminal
          </p>
        </Reveal>

        <Reveal delay={0.75}>
          <p className="font-mono text-[12px] text-forge-body leading-relaxed max-w-sm mb-12">
            Research market regimes, test strategies,
            <br />
            and analyse event-driven volatility.
          </p>
        </Reveal>

        <Reveal delay={0.9}>
          {loading ? (
            <div className="h-10 w-36 bg-forge-surface border border-forge-dim animate-pulse" />
          ) : user ? (
            <InteractiveHoverButton
              text="Enter Terminal"
              onClick={() => router.push("/terminal")}
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <InteractiveHoverButton
                text="Enter Terminal"
                onClick={() => router.push("/terminal")}
              />
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-forge-body border border-forge-dim hover:border-forge-muted hover:text-forge-text px-5 py-2.5 transition-colors duration-200"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>
          )}
        </Reveal>
      </div>

      <StatusStrip />
    </div>
  );
}
