"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, ChartNoAxesCombined, Newspaper, ScanSearch, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { GradientText } from "@/components/ui/gradient-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Theme } from "@/components/ui/theme";
import { getAllPosts } from "@/lib/blog";
import { formatDateLabel } from "@/lib/date";

const blogPosts = getAllPosts().slice(0, 3);

const featureCards = [
  {
    icon: ChartNoAxesCombined,
    eyebrow: "Research Workflow",
    title: "Backtests that stay anchored to market context",
    body: "Explore trend, volatility, and drawdown behavior in one workflow so strategy results are easier to trust and explain.",
  },
  {
    icon: ScanSearch,
    eyebrow: "Regime Analysis",
    title: "See when conditions change before the signal does",
    body: "Track market regime shifts, live posture, and event-driven volatility from a single terminal built for systematic decision-making.",
  },
  {
    icon: Newspaper,
    eyebrow: "Event Intelligence",
    title: "Know what's moving the market before you size a position",
    body: "Layer macro events, earnings, and catalyst timelines directly onto your strategy view so you're never caught off guard by scheduled volatility.",
  },
];

const sections = [
  {
    label: "Who it is for",
    title: "Built for traders and researchers who need more than a chart",
    body: "AlphaForge is a systematic research terminal for people who think in strategies, not hunches. It combines regime context, backtest validation, and event-driven signals into a single surface so you can make decisions with the full picture in view.",
    bullets: ["Understand why a strategy works, not just that it worked", "Combine regime context with backtest results in one workflow", "Surface event risk before it shows up in your P&L"],
  },
  {
    label: "What it replaces",
    title: "From scattered tools to one coherent research surface",
    body: "Most traders piece together a backtest engine, a regime tracker, a news feed, and a spreadsheet. AlphaForge collapses that stack into a single terminal purpose-built for systematic decision-making.",
    bullets: ["One workspace for testing, monitoring, and analyzing", "Strategy and regime context always visible together", "Built for iterating fast without losing the thread"],
  },
];

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function TopBar({
  signedInEmail,
  onSignOut,
}: {
  signedInEmail?: string;
  onSignOut: () => void;
}) {
  return (
    <motion.div
      className="sticky top-0 z-40 border-b border-forge-border/70 bg-forge-bg/80 backdrop-blur-xl"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-forge-bright">
            AlphaForge
          </Link>
          <div className="hidden items-center gap-4 font-mono text-[10px] uppercase tracking-[0.24em] text-forge-label md:flex">
            <a href="#platform">Platform</a>
            <a href="#workflow">Workflow</a>
            <Link href="/blog">Blog</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Theme variant="dropdown" size="sm" showLabel />
          {signedInEmail ? (
            <>
              <span className="hidden max-w-[220px] truncate font-mono text-[10px] tracking-[0.16em] text-forge-body md:block">
                {signedInEmail}
              </span>
              <button
                onClick={onSignOut}
                className="border border-forge-dim px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forge-body transition-colors hover:border-forge-accent hover:text-forge-bright"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/blog"
              className="hidden border border-forge-dim px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forge-body transition-colors hover:border-forge-accent hover:text-forge-bright md:block"
            >
              Read blog
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatRail() {
  const stats = [
    { label: "Market regimes", value: "Trend-aware views" },
    { label: "Strategy testing", value: "Backtest + live mode" },
    { label: "Event coverage", value: "Catalyst timeline" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-forge-border/80 bg-forge-panel/70 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-forge-label">{stat.label}</p>
          <p className="mt-3 font-serif text-2xl font-bold text-forge-bright">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-forge-bg text-forge-text">
      <BackgroundPaths />

      <div className="absolute inset-x-0 top-24 h-[520px] bg-[radial-gradient(circle_at_top,rgba(120,212,255,0.18),transparent_54%)]" />
      <TopBar signedInEmail={user?.email} onSignOut={signOut} />

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <Reveal>
              <p className="mb-6 inline-flex items-center gap-2 border border-forge-dim/80 bg-forge-panel/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-forge-label">
                <Sparkles className="h-3.5 w-3.5 text-forge-accent" />
                Systematic research terminal
              </p>
            </Reveal>

            <GradientText as="h1" className="max-w-4xl font-serif text-[clamp(4rem,9vw,7.4rem)] font-extrabold leading-[0.92] tracking-[-0.04em]">
              Research smarter. Trade with conviction.
            </GradientText>

            <Reveal delay={0.08} className="mt-8 max-w-2xl">
              <p className="text-lg leading-8 text-forge-body md:text-xl">
                AlphaForge is the terminal for systematic traders — combining market regime analysis,
                strategy backtesting, and event-driven research into one coherent workflow.
              </p>
            </Reveal>

            <Reveal delay={0.14} className="mt-10 flex flex-col gap-4 sm:flex-row">
              {loading ? (
                <div className="h-12 w-52 animate-pulse border border-forge-dim bg-forge-surface/60" />
              ) : (
                <InteractiveHoverButton
                  text={user ? "Enter Terminal" : "Get Started"}
                  onClick={() => router.push(user ? "/terminal" : "/auth")}
                />
              )}

              <Link
                href="/blog"
                className="inline-flex h-12 items-center justify-center gap-2 border border-forge-dim bg-forge-surface/50 px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-forge-text transition-colors hover:border-forge-accent hover:text-forge-bright"
              >
                Explore blog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal delay={0.2} className="mt-12">
              <StatRail />
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <div className="relative overflow-hidden border border-forge-border/90 bg-forge-surface/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,212,255,0.12),transparent_38%)]" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-forge-border/80 pb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-forge-label">AlphaForge Terminal</p>
                    <p className="mt-2 font-serif text-3xl font-bold text-forge-bright">Strategy meets market reality</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-forge-accent" />
                </div>

                <div className="mt-6 space-y-4">
                  {featureCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.title} className="border border-forge-border/80 bg-forge-panel/80 p-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 rounded-full border border-forge-dim/80 bg-forge-pos-dim p-2 text-forge-pos">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-forge-label">{card.eyebrow}</p>
                            <h2 className="mt-2 font-serif text-2xl font-bold text-forge-bright">{card.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-forge-body">{card.body}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="platform" className="mx-auto max-w-7xl px-6 py-10 md:py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            {sections.map((section, index) => (
              <Reveal key={section.title} delay={index * 0.08}>
                <div className="h-full border border-forge-border/80 bg-forge-surface/70 p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-forge-accent">{section.label}</p>
                  <h2 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-tight text-forge-bright">{section.title}</h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-forge-body">{section.body}</p>
                  <div className="mt-8 space-y-3">
                    {section.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 border-t border-forge-border/70 pt-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-forge-accent" />
                        <p className="text-sm leading-7 text-forge-text">{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-6 py-10 md:py-20">
          <Reveal>
            <div className="mb-10 max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-forge-accent">Workflow</p>
              <h2 className="mt-4 font-serif text-5xl font-bold tracking-tight text-forge-bright">From first signal to sized position</h2>
              <p className="mt-5 text-lg leading-8 text-forge-body">
                AlphaForge structures your research in three stages — so you always know what the market is doing,
                whether your strategy fits, and what risks are on the horizon.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01", "Orient", "Understand the current market regime — trend direction, volatility state, and macro posture — before committing to any strategy."],
              ["02", "Validate", "Run backtests with full regime context attached so results reflect real conditions, not just favorable historical windows."],
              ["03", "Execute", "Monitor live positions alongside event calendars and regime shifts so you're never surprised by what the market already knew."],
            ].map(([step, title, body], index) => (
              <Reveal key={title} delay={index * 0.08}>
                <div className="h-full border border-forge-border/80 bg-forge-panel/75 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-forge-label">{step}</p>
                  <h3 className="mt-4 font-serif text-3xl font-bold text-forge-bright">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-forge-body">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 md:py-20">
          <Reveal>
            <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-forge-accent">Blog</p>
                <h2 className="mt-4 font-serif text-5xl font-bold tracking-tight text-forge-bright">From the research desk</h2>
                <p className="mt-5 text-lg leading-8 text-forge-body">
                  Market regime breakdowns, strategy deep-dives, and systematic research frameworks — written for traders who think in systems.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 self-start border border-forge-dim px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-forge-body transition-colors hover:border-forge-accent hover:text-forge-bright"
              >
                View all posts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.08}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col border border-forge-border/80 bg-forge-surface/70 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-forge-accent/60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-forge-accent">{post.category}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-forge-label">{post.readingTime}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-3xl font-bold leading-tight text-forge-bright">{post.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-forge-body">{post.description}</p>
                  <div className="mt-8 flex items-center justify-between border-t border-forge-border/70 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-forge-label">{formatDateLabel(post.publishedAt)}</span>
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forge-text">
                      Read article
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:pb-24 md:pt-20">
          <Reveal>
            <div className="overflow-hidden border border-forge-border/80 bg-forge-surface/70 p-8 md:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-forge-accent">Next step</p>
                  <h2 className="mt-4 max-w-3xl font-serif text-5xl font-bold leading-tight text-forge-bright">
                    Stop guessing at market context. Start researching with it.
                  </h2>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-forge-body">
                    AlphaForge gives you the full picture — regime state, strategy performance, and upcoming catalysts — all in one place, before you make a move.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                  {!loading && (
                    <InteractiveHoverButton
                      text={user ? "Enter Terminal" : "Create Account"}
                      onClick={() => router.push(user ? "/terminal" : "/auth")}
                    />
                  )}
                  <Link
                    href="/blog"
                    className="inline-flex h-12 items-center justify-center border border-forge-dim px-6 font-mono text-[10px] uppercase tracking-[0.24em] text-forge-body transition-colors hover:border-forge-accent hover:text-forge-bright"
                  >
                    Visit the blog
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
