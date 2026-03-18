"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── config ───────────────────────────────────────────────────────────────────
// Change this to your Streamlit URL.
// Local dev:  http://localhost:8501
// Production: https://your-streamlit-app.streamlit.app
const STREAMLIT_URL = process.env.NEXT_PUBLIC_STREAMLIT_URL ?? "http://localhost:8501";

// ─── top navigation bar ───────────────────────────────────────────────────────
function TerminalNav({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-6 h-11 bg-forge-surface border-b border-forge-border">
      <div className="flex items-center gap-3">
        <span className="font-serif text-[15px] font-bold text-forge-text tracking-tight">
          AlphaForge
        </span>
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-forge-pos border border-forge-pos-dim px-2 py-0.5 rounded-none">
          Terminal
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-forge-pos animate-pulse" />
          <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-forge-muted">
            Live
          </span>
        </div>

        <button
          onClick={onBack}
          className="font-mono text-[8px] tracking-[0.18em] uppercase text-forge-muted border border-forge-dim px-3 py-1.5 hover:text-forge-text hover:border-forge-muted transition-colors duration-200"
        >
          ← Landing
        </button>
      </div>
    </div>
  );
}

// ─── loading state ────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-forge-bg">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-forge-muted rounded-full"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-forge-muted">
        Connecting to Streamlit
      </p>
      <p className="font-mono text-[9px] text-forge-dim">
        {STREAMLIT_URL}
      </p>
    </div>
  );
}

// ─── main shell ───────────────────────────────────────────────────────────────
export function TerminalShell() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  // Reset scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen bg-forge-bg overflow-hidden">
      <TerminalNav onBack={handleBack} />

      <div className="flex-1 relative overflow-hidden">
        {/* loading overlay */}
        <AnimatePresence>
          {!loaded && (
            <motion.div
              className="absolute inset-0 z-10 flex flex-col"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LoadingState />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streamlit iframe */}
        <iframe
          src={STREAMLIT_URL}
          className="w-full h-full border-0"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
          onLoad={() => setLoaded(true)}
          title="AlphaForge Terminal"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
