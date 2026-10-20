// lib/blog.ts
// Drop this file at src/lib/blog.ts (or wherever your @/lib alias points).
// Shape is derived from the BlogPostPage component in app/blog/[slug]/page.tsx.

export interface BlogSection {
  heading: string;
  body: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  heroStat: string;
  keywords: string[];
  sections: BlogSection[];
}

const posts: BlogPost[] = [
  // ─── NEW POSTS ───────────────────────────────────────────────────────────────
  {
    slug: "walk-forward-optimization",
    title: "Walk-Forward Optimization: Backtesting a Strategy the Honest Way",
    description:
      "A single backtest over all of history quietly cheats — it tunes your parameters on the same data it grades them on. Walk-forward analysis fixes that by only ever trading on data the optimizer has never seen.",
    category: "Backtesting",
    publishedAt: "2026-09-15",
    readingTime: "9 min read",
    heroStat: "In-sample Sharpe overstates out-of-sample Sharpe by 2–3x on average",
    keywords: [
      "walk-forward optimization",
      "out-of-sample testing",
      "backtest validation",
      "parameter stability",
      "overfitting",
    ],
    sections: [
      {
        heading: "The problem with one big backtest",
        body: [
          "When you grid-search fast and slow moving averages over twenty years of data and keep the pair with the best Sharpe, you haven't discovered an edge — you've found the combination that best fit the noise in that specific history. The number you report is an in-sample result, and in-sample results are almost always flattering.",
          "The honest question isn't 'what parameters worked best on the past?' It's 'if I had chosen parameters using only the data available at the time, how would they have performed next?' Walk-forward analysis is the machinery for answering that question directly.",
        ],
      },
      {
        heading: "How a walk-forward works",
        body: [
          "Split history into rolling windows. On each training window, optimize your parameters — for a momentum system, that might be the fast/slow SMA pair that maximizes Sharpe. Then apply those exact parameters, frozen, to the next test window the optimizer never touched. Slide forward and repeat.",
          "Chaining every out-of-sample test window together gives you a single continuous equity curve built entirely from decisions made with no knowledge of the future. That curve is a far better estimate of live performance than any in-sample backtest, because it reproduces the one thing you actually have to do in production: pick parameters before you know what happens next.",
        ],
      },
      {
        heading: "Reading the fold log",
        body: [
          "The per-fold record is as informative as the equity curve. If the optimizer picks wildly different parameters every window — fast=10 here, fast=30 there — the strategy has no stable edge; it's chasing whatever worked most recently. Stable parameter selection across folds is a sign the edge is real.",
          "Watch the gap between training Sharpe and out-of-sample Sharpe too. A small, consistent gap is healthy. A large gap — great in training, mediocre or negative out-of-sample — is the signature of overfitting, and no amount of further tuning will close it.",
        ],
      },
      {
        heading: "Choosing window sizes",
        body: [
          "Training windows that are too short overfit to a single regime; too long and the parameters can't adapt as markets change. A common starting point is a training window of roughly a year of trading days with a test window of about a quarter, then stress-testing how sensitive your results are to those choices.",
          "If the out-of-sample curve falls apart when you nudge the window sizes, that fragility is itself a finding — robust edges survive reasonable changes to the testing protocol. Flattening positions at each fold boundary also keeps one window's leftover trade from contaminating the next.",
        ],
      },
    ],
  },
  {
    slug: "transaction-costs-hidden-tax",
    title: "Transaction Costs: The Hidden Tax That Decides Your Edge",
    description:
      "Most backtests die not from a bad signal but from ignoring what it costs to act on one. Commissions and slippage compound with turnover, and high-frequency strategies feel it most.",
    category: "Execution",
    publishedAt: "2026-09-28",
    readingTime: "7 min read",
    heroStat: "A 10bps round-trip cost can flip a profitable high-turnover strategy negative",
    keywords: [
      "transaction costs",
      "slippage",
      "commission",
      "turnover",
      "backtest realism",
    ],
    sections: [
      {
        heading: "Why gross returns lie",
        body: [
          "A strategy that looks brilliant on gross returns can be a loser once you subtract the cost of every trade. Each entry and each exit pays commission and slippage, and those small percentages are charged on turnover — so the more a strategy trades, the harder costs bite.",
          "The failure mode is predictable: a signal that flips frequently racks up hundreds of round trips a year. Even a few basis points per leg, multiplied across that activity, can quietly consume the entire edge. The gross curve climbs; the net curve goes sideways or down.",
        ],
      },
      {
        heading: "Modeling cost honestly",
        body: [
          "A defensible model charges cost on every change in position, once per leg: entering costs you, and exiting costs you again. A round trip therefore pays twice, which is exactly what happens in the real world. Don't fold both legs into a single charge — you'll understate the drag on strategies that flip often.",
          "Split the figure into commission and slippage because they behave differently. Commission is roughly fixed per trade; slippage widens in volatile or illiquid conditions, which is precisely when an active strategy trades most. A single blended number hides that the worst slippage arrives at the worst time.",
        ],
      },
      {
        heading: "Turnover is the lever",
        body: [
          "Average daily turnover tells you how cost-sensitive a strategy is before you run a single cost scenario. Two systems with identical gross Sharpe can have completely different net profiles if one holds for weeks and the other churns daily.",
          "The practical move is to test your strategy across a sweep of cost assumptions, from optimistic to pessimistic. If the edge only survives at zero or near-zero costs, it isn't an edge — it's an artifact. Robust strategies keep most of their Sharpe even when you assume you'll trade worse than you hope to.",
        ],
      },
    ],
  },
  {
    slug: "reading-risk-adjusted-returns",
    title: "Beyond Sharpe: Reading Sortino, Calmar, and Drawdown Together",
    description:
      "The Sharpe ratio is a useful summary and a poor verdict. To judge a strategy you have to read a panel of metrics that each capture a different kind of risk.",
    category: "Metrics",
    publishedAt: "2026-10-05",
    readingTime: "8 min read",
    heroStat: "Two strategies with equal Sharpe can have 3x different max drawdowns",
    keywords: [
      "sharpe ratio",
      "sortino ratio",
      "calmar ratio",
      "maximum drawdown",
      "risk-adjusted returns",
    ],
    sections: [
      {
        heading: "What Sharpe does and doesn't tell you",
        body: [
          "Sharpe measures return per unit of total volatility. Its blind spot is that it punishes upside and downside equally — a strategy with sharp profitable spikes is penalized for the same 'volatility' that made you money. It also says nothing about the shape or depth of your losses.",
          "That's why two strategies can post the same Sharpe and feel nothing alike to live through. One might grind out steady small gains with a shallow worst-case loss; the other might ride a brutal fifty-percent drawdown to the same average. The ratio can't distinguish them, but your account and your nerves can.",
        ],
      },
      {
        heading: "Sortino: penalizing only the pain",
        body: [
          "Sortino fixes Sharpe's symmetry problem by dividing excess return by downside deviation alone — volatility that comes from losses, not gains. A strategy whose swings are mostly upward will show a Sortino meaningfully higher than its Sharpe.",
          "Comparing the two is itself informative. When Sortino sits far above Sharpe, the strategy's volatility is skewed toward the upside, which is the kind of volatility you want. When they're close, the risk is roughly symmetric.",
        ],
      },
      {
        heading: "Calmar and drawdown: surviving the worst day",
        body: [
          "Calmar divides your annualized return by the magnitude of your maximum drawdown — return earned per unit of worst-case pain. It answers the question that actually ends strategies: not 'how volatile is this?' but 'how deep is the hole it can put me in, and is the reward worth it?'",
          "Maximum drawdown deserves to be read on its own, not just inside a ratio. A 20% max drawdown and a 55% max drawdown are different businesses even at the same CAGR, because recovering from a 55% loss requires a 122% gain. Pair drawdown depth with how long recoveries take before you trust any headline return.",
        ],
      },
      {
        heading: "Read the panel, not the number",
        body: [
          "No single metric is a verdict. Sharpe for overall efficiency, Sortino for the shape of volatility, Calmar and max drawdown for survivability, win rate and average win/loss for the texture of the trades — together they describe a strategy; alone they mislead.",
          "Be especially skeptical of a gaudy number backed by a handful of trades. A 3.0 Sharpe over twelve trades is noise wearing a suit. Weight every ratio by the sample size behind it, and prefer a modest edge proven over hundreds of trades to a spectacular one proven over a dozen.",
        ],
      },
    ],
  },
  {
    slug: "momentum-vs-mean-reversion",
    title: "Momentum vs. Mean Reversion: Matching the Strategy to the Regime",
    description:
      "Momentum and mean reversion are opposite bets on what price does next. Neither works everywhere — the skill is knowing which environment you're in.",
    category: "Strategy Research",
    publishedAt: "2026-10-12",
    readingTime: "8 min read",
    heroStat: "The same asset can reward opposite strategies in different regimes",
    keywords: [
      "momentum",
      "mean reversion",
      "market regime",
      "trend following",
      "bollinger bands",
    ],
    sections: [
      {
        heading: "Two opposite bets",
        body: [
          "Momentum assumes continuation: what has been rising will keep rising, so you buy strength and ride the trend. Mean reversion assumes the opposite — that price overshoots and snaps back — so you buy weakness and sell strength, fading the extremes.",
          "Because they're mirror images, the market condition that feeds one starves the other. A strong directional trend rewards momentum and whipsaws a mean-reversion trader who keeps betting on a reversal that doesn't come. A choppy, range-bound market rewards mean reversion and chops up a momentum trader chasing breakouts that fail.",
        ],
      },
      {
        heading: "When momentum works",
        body: [
          "Momentum earns its keep in trending regimes — sustained moves where a rising moving average stays above a slower one for long stretches. A simple fast-over-slow SMA crossover captures this: stay long while the fast average leads, step aside when it doesn't.",
          "Its weakness is the sideways market, where price crosses back and forth across the averages and every signal is a small loss. Momentum systems typically have lower win rates but larger average wins — a few big trends pay for many small whipsaws, so cutting the whipsaws without clipping the trends is the whole game.",
        ],
      },
      {
        heading: "When mean reversion works",
        body: [
          "Mean reversion thrives in range-bound, lower-volatility conditions. A Bollinger-band system expresses it cleanly: buy when price stretches below the lower band, exit as it reverts toward the middle. Here, high win rates with modest average gains are the norm.",
          "The danger is a regime change. A mean-reversion trade that buys the dip in a market that has started trending down keeps buying into a falling knife. The edge that made you money in the range becomes the mechanism that bleeds you out in the trend — which is why a volatility or trend filter matters so much.",
        ],
      },
      {
        heading: "Let the regime decide",
        body: [
          "Rather than marry one approach, classify the environment first and deploy the matching tool: momentum in trends, mean reversion in chop, and reduced or no exposure when volatility spikes and both edges deteriorate. The classifier doesn't have to be perfect to add value — it just has to keep you from running the wrong strategy in the wrong market.",
          "The honest caveat is that regime detection lags; by the time a shift is obvious it's partly priced. Expect to be wrong at the turns, size positions so those mistakes are survivable, and treat the regime switch as a tilt in the odds rather than a guarantee.",
        ],
      },
    ],
  },
  // ─── EXISTING POST (cleaned up) ──────────────────────────────────────────────
  {
    slug: "systematic-trading-research-workflow",
    title: "Building a Systematic Trading Research Workflow",
    description:
      "A step-by-step guide to structuring your research process — from hypothesis generation through backtest validation and live deployment — so nothing falls through the cracks.",
    category: "Research Workflow",
    publishedAt: "2024-12-10",
    readingTime: "8 min read",
    heroStat: "Structured workflows reduce strategy abandonment by ~60%",
    keywords: [
      "systematic trading",
      "research workflow",
      "backtest",
      "strategy development",
      "quant research",
    ],
    sections: [
      {
        heading: "Why most research workflows break down",
        body: [
          "Most traders iterate on strategies the same way they browse the internet — following whatever looks interesting, jumping between ideas, and never building on prior work. The result is a graveyard of half-tested strategies and no institutional memory.",
          "A systematic workflow isn't about slowing down. It's about creating a feedback loop where each research cycle makes the next one faster and more reliable. The structure is what lets you move quickly without losing the thread.",
        ],
      },
      {
        heading: "Stage 1: Hypothesis generation",
        body: [
          "Every strategy starts as a belief about market behavior. The discipline is making that belief explicit before you touch any data. Write it down: what edge do you think exists, in what conditions, and why should it persist?",
          "Good hypotheses are falsifiable. 'Momentum works' is not a hypothesis. 'Three-month price momentum in large-cap equities produces positive risk-adjusted returns in trending regimes but not in mean-reverting ones' is. The specificity is what makes testing meaningful.",
        ],
      },
      {
        heading: "Stage 2: Regime contextualization",
        body: [
          "Before you run a single backtest, classify the market environments in your sample. Which periods were trending? Which were range-bound? Where did volatility spike? This context changes everything about how you interpret results.",
          "A strategy that works across all regimes is either very robust or suspiciously overfit. Most real edges are regime-specific. Knowing that upfront helps you build strategies that know when to stand down.",
        ],
      },
      {
        heading: "Stage 3: Validation and out-of-sample testing",
        body: [
          "Walk-forward testing is the minimum bar. Split your data into development and validation windows, optimize on one, evaluate on the other — and never touch the validation set until you're done with the development phase.",
          "Check that your strategy's performance metrics are consistent across different sub-periods, not just strong in aggregate. A strategy that works in one decade and fails in another isn't robust; it's lucky.",
        ],
      },
      {
        heading: "Stage 4: Live monitoring",
        body: [
          "The workflow doesn't end at deployment. Live performance should be tracked against backtest expectations, with explicit alerts for when drawdown or volatility diverges from the expected range.",
          "Most live underperformance is detectable early. The traders who catch it are the ones who built monitoring into the workflow before they went live, not after something went wrong.",
        ],
      },
    ],
  },

  // ─── 10 NEW POSTS ────────────────────────────────────────────────────────────
  {
    slug: "what-is-a-market-regime",
    title: "What Is a Market Regime — and Why Your Backtest Doesn't Know",
    description:
      "Most backtests treat history as a flat surface. Market regimes reveal the terrain beneath — trending, mean-reverting, high-volatility, or crisis. Here's how to think about them.",
    category: "Regime Analysis",
    publishedAt: "2025-01-08",
    readingTime: "7 min read",
    heroStat: "4 core regime types every systematic trader should classify",
    keywords: [
      "market regime",
      "regime analysis",
      "trending market",
      "mean reversion",
      "volatility regime",
      "systematic trading",
    ],
    sections: [
      {
        heading: "The flat-history problem",
        body: [
          "When you run a backtest over ten years of data, the engine treats 2009 and 2017 as equivalent environments. They aren't. One was a crisis recovery with extreme dispersion and broken correlations. The other was one of the lowest-volatility bull markets on record. Strategies that thrived in one environment often failed in the other.",
          "Market regimes are the mechanism that makes historical data heterogeneous. A regime is a period during which the statistical properties of the market — trend, volatility, correlation structure — are relatively stable. The transitions between regimes are where most systematic strategies lose money.",
        ],
      },
      {
        heading: "The four regime types",
        body: [
          "Trending regimes are characterized by persistent directional moves, positive autocorrelation in returns, and expanding ranges. Momentum strategies thrive here. Mean-reversion strategies bleed slowly.",
          "Range-bound or mean-reverting regimes feature compressed volatility, negative return autocorrelation, and price action that repeatedly tests the same support and resistance levels. The edges are reversed — momentum strategies lose and mean-reversion strategies win.",
          "High-volatility regimes often overlap with both trending and mean-reverting behavior but are defined primarily by the magnitude of moves. Correlation structures break down, diversification benefits compress, and position sizing becomes the dominant risk driver.",
          "Crisis regimes are their own category — characterized by correlation spikes, liquidity collapse, and non-linear drawdowns. Most strategies are long volatility risk implicitly. Crisis regimes make that exposure explicit.",
        ],
      },
      {
        heading: "How to detect regime shifts",
        body: [
          "Simple regime detection uses price-based indicators: the slope of a long-term moving average, realized volatility relative to a historical baseline, or the ratio of up days to down days over a rolling window. These are lagging but robust.",
          "More sophisticated approaches use hidden Markov models, volatility term structure, or cross-asset signals like credit spreads and yield curve shape to detect regime transitions in real time. The goal is not to predict the next regime but to know which one you're in right now.",
        ],
      },
      {
        heading: "Regime awareness as a filter, not a prediction",
        body: [
          "The most practical application of regime analysis is not regime prediction — it's regime filtering. Instead of asking 'what regime comes next,' ask 'should this strategy be active in the current regime?'",
          "A trend-following strategy with a regime filter that turns off in mean-reverting conditions will have fewer total trades, but the trades it takes will be higher quality. The reduction in noise is often worth more than the reduction in opportunity.",
        ],
      },
    ],
  },

  {
    slug: "trend-following-in-volatile-regimes",
    title: "Trend Following in Volatile Regimes: When the Signal Lies",
    description:
      "Trend-following strategies are regime-dependent. Understand how elevated volatility distorts momentum signals and what filters can help you avoid trading noise.",
    category: "Strategy Research",
    publishedAt: "2025-01-22",
    readingTime: "9 min read",
    heroStat: "Signal-to-noise ratio drops ~40% in high-volatility regimes",
    keywords: [
      "trend following",
      "momentum strategy",
      "volatility regime",
      "signal quality",
      "systematic trading",
      "noise filtering",
    ],
    sections: [
      {
        heading: "Trend following's hidden assumption",
        body: [
          "Every trend-following strategy makes an implicit assumption: that price moves contain more signal than noise. In low-volatility trending regimes, this is usually true. Daily returns cluster in one direction, momentum builds, and the strategy rides the move.",
          "In high-volatility environments, the assumption breaks down. Large daily swings in both directions create momentum signals that reverse before they mature. The strategy is reacting to noise and calling it a trend.",
        ],
      },
      {
        heading: "How volatility distorts momentum calculations",
        body: [
          "Most momentum indicators — moving average crossovers, rate of change, relative strength — are calculated on raw price or return data without volatility adjustment. In a low-vol environment, a 2% move over five days represents meaningful directional conviction. In a high-vol environment where daily swings are 2%, it represents nothing.",
          "The fix is volatility normalization: divide raw momentum by a rolling volatility estimate before applying any threshold. This converts the signal from a raw price metric to a standardized score that means the same thing across different volatility environments.",
        ],
      },
      {
        heading: "Regime filters that actually work",
        body: [
          "The simplest effective filter is a realized volatility threshold. Measure 20-day realized volatility and compare it to a long-term median. When current vol is more than 1.5x the median, reduce position size or stand aside entirely.",
          "A more nuanced filter uses the VIX term structure. When short-dated implied volatility exceeds long-dated implied volatility — an inverted term structure — the market is pricing near-term fear. Trend-following signals generated in this environment have historically lower follow-through.",
          "Cross-asset confirmation adds another layer. A trend signal in equities that is not confirmed by credit, rates, or currency behavior is less likely to persist than one where multiple asset classes are moving in the same direction.",
        ],
      },
      {
        heading: "Sizing down vs. turning off",
        body: [
          "The debate between reducing size and going flat in adverse regimes usually resolves in favor of reducing size. Turning off completely introduces its own risk: the regime might shift back before you re-engage, and you miss the trade that pays for all the false signals you avoided.",
          "A volatility-scaled position sizing model handles this automatically. As realized vol rises, positions shrink. As vol compresses, they expand. The strategy is always active but appropriately sized for the environment it's operating in.",
        ],
      },
    ],
  },

  {
    slug: "backtest-overfitting-checklist",
    title: "The Backtest Overfitting Checklist",
    description:
      "A practical framework for stress-testing your backtest results before you trust them with real capital. Covers in-sample bias, parameter sensitivity, and walk-forward validation.",
    category: "Backtesting",
    publishedAt: "2025-02-05",
    readingTime: "8 min read",
    heroStat: "5 red flags that mean your backtest isn't telling the truth",
    keywords: [
      "backtest overfitting",
      "curve fitting",
      "walk-forward testing",
      "parameter sensitivity",
      "strategy validation",
      "out-of-sample testing",
    ],
    sections: [
      {
        heading: "Why overfitting is the default outcome",
        body: [
          "Given enough parameters and enough historical data, you can build a strategy with a near-perfect backtest. This is not skill — it's optimization. The strategy has memorized the past rather than learning a rule that will hold in the future.",
          "Overfitting is the default outcome of unconstrained strategy development. Every iteration that improves in-sample performance moves the strategy slightly further from a real edge and slightly closer to a statistical artifact. The checklist is how you catch this before it costs you.",
        ],
      },
      {
        heading: "Red flag 1: Sharpe ratio above 2 on a simple strategy",
        body: [
          "Simple strategies — a moving average crossover, a volatility breakout, a mean-reversion trigger — rarely produce Sharpe ratios above 1.5 in honest backtests. If your simple strategy is showing a Sharpe of 2.5 or higher, something is wrong: look-ahead bias, survivorship bias, or curve fitting.",
          "Complex strategies with many parameters can legitimately produce high Sharpes in-sample. That's precisely the problem. The complexity that drives the in-sample performance is the same complexity that makes it fragile out-of-sample.",
        ],
      },
      {
        heading: "Red flag 2: Performance that depends on specific parameters",
        body: [
          "Robust strategies perform reasonably well across a range of parameter values. Overfit strategies have a narrow peak — change the lookback from 20 to 22 days and the Sharpe drops by half.",
          "Run a parameter sensitivity analysis. Plot performance across a grid of parameter combinations. If the peak performance is surrounded by a steep cliff rather than a gradual slope, the strategy is fit to a specific historical artifact, not a genuine market structure.",
        ],
      },
      {
        heading: "Red flag 3: Inconsistent sub-period performance",
        body: [
          "Split your backtest into thirds and check performance in each segment separately. An honest strategy should perform reasonably across all three — perhaps better in some regimes than others, but not catastrophically bad in any.",
          "If most of the alpha comes from a single period — say, 2008 or 2020 — ask whether you've built a crisis strategy or a general strategy that happened to work during one crisis.",
        ],
      },
      {
        heading: "Red flags 4 and 5: No transaction costs, and no slippage model",
        body: [
          "Backtests that don't include realistic transaction costs and slippage are not backtests — they're simulations of a market that doesn't exist. The higher your turnover, the more these costs matter.",
          "Use bid-ask spread estimates for liquid instruments and market impact models for larger size. If your strategy's edge disappears after including realistic friction, it was never a real edge. Better to find out in backtesting than in live trading.",
        ],
      },
    ],
  },

  {
    slug: "drawdown-anatomy",
    title: "Anatomy of a Drawdown: What the Curve Is Actually Telling You",
    description:
      "Peak-to-trough numbers hide more than they reveal. Learn how to read drawdown shape, duration, and recovery slope to diagnose strategy health in real time.",
    category: "Risk Management",
    publishedAt: "2025-02-19",
    readingTime: "6 min read",
    heroStat: "Recovery time is 3–5× more predictive of strategy health than drawdown depth",
    keywords: [
      "drawdown analysis",
      "risk management",
      "strategy monitoring",
      "maximum drawdown",
      "recovery time",
      "systematic risk",
    ],
    sections: [
      {
        heading: "The number that misleads",
        body: [
          "Maximum drawdown is the most commonly reported risk metric and one of the least useful in isolation. Two strategies can have identical 20% max drawdowns and completely different risk profiles depending on how fast the drawdown developed, how long it lasted, and how cleanly it recovered.",
          "The shape of the drawdown curve is a diagnostic tool. It tells you whether losses came from a single event or slow attrition, whether the strategy is trending toward recovery or grinding lower, and whether the environment causing losses is temporary or structural.",
        ],
      },
      {
        heading: "Drawdown shape: event vs. bleed",
        body: [
          "An event-driven drawdown is steep and fast — a sudden shock that causes a sharp loss followed by a clear inflection point. These are often recoverable because the environment that caused the loss is transient. Crisis volatility, a fat-tail event, a liquidity gap.",
          "A slow-bleed drawdown is more dangerous. Gradual losses over many weeks or months indicate that the strategy is consistently wrong about market direction or that its edge has eroded. There is no single event to point to and no clean recovery inflection. If you see this pattern in a live strategy, start asking harder questions.",
        ],
      },
      {
        heading: "Recovery slope as a health indicator",
        body: [
          "After the drawdown troughs, how fast does the strategy recover? A healthy recovery mirrors the speed of the drawdown — fast losses, fast recovery. Slow recoveries after fast drawdowns suggest the strategy is working harder than usual to make back what it lost, often by taking on more risk or operating outside its normal parameters.",
          "Track your expected recovery time as a function of drawdown depth for each strategy. When live recovery time exceeds the historical distribution for a drawdown of that size, that is a quantitative signal to reduce exposure.",
        ],
      },
      {
        heading: "Using drawdown analysis in real time",
        body: [
          "Set drawdown alerts at two levels: a caution level where you review positions and verify the strategy is behaving as expected, and a stop level where you reduce size or go flat pending investigation.",
          "These thresholds should be calibrated to the strategy's historical drawdown distribution, not set at arbitrary round numbers. A strategy with a historical max drawdown of 8% has very different risk tolerances than one with a 25% historical max.",
        ],
      },
    ],
  },

  {
    slug: "event-driven-volatility",
    title: "Trading Around Events: How Scheduled Catalysts Reshape Risk",
    description:
      "Earnings, Fed decisions, and macro releases inject predictable volatility spikes. This piece breaks down how to model event risk and avoid being the liquidity everyone else is leaning on.",
    category: "Event Intelligence",
    publishedAt: "2025-03-05",
    readingTime: "8 min read",
    heroStat: "Implied volatility expands an average of 28% in the 48h before major catalysts",
    keywords: [
      "event-driven trading",
      "earnings volatility",
      "FOMC",
      "macro events",
      "implied volatility",
      "event risk",
      "catalyst",
    ],
    sections: [
      {
        heading: "Scheduled uncertainty",
        body: [
          "Unlike geopolitical shocks or flash crashes, many of the most significant volatility events are scheduled in advance. Earnings releases, FOMC decisions, CPI prints, and non-farm payrolls all appear on a calendar weeks or months ahead. This gives systematic traders a structural advantage — but only if they build event awareness into their workflow.",
          "Most retail and many institutional strategies treat event periods the same as non-event periods. They enter and exit based on technical signals without adjusting for the known fact that volatility is about to spike. The result is systematic overexposure at exactly the wrong time.",
        ],
      },
      {
        heading: "How markets price event risk",
        body: [
          "Options markets are the cleanest measure of expected event volatility. The implied volatility of short-dated options around an event reflects the market's consensus expectation of how large the move will be. When realized moves consistently exceed or fall short of implied expectations, that gap is an edge.",
          "Earnings seasons exhibit a consistent pattern: implied volatility rises in the days before the announcement and collapses immediately after — regardless of whether the result is good or bad. This pattern, known as volatility crush, creates opportunities for both buyers and sellers of event volatility depending on whether they expect the actual move to exceed the implied move.",
        ],
      },
      {
        heading: "Position management around events",
        body: [
          "The simplest approach is avoidance: don't hold positions in instruments with major upcoming catalysts unless you have a specific view on the event itself. This eliminates event risk entirely but sacrifices return.",
          "A more nuanced approach is size reduction. Shrink positions to a fraction of normal size in the 48 hours before a major event and restore full size afterward. The cost is some return on the recovery move. The benefit is dramatically reduced exposure to the binary outcome.",
          "Event-aware position sizing uses implied volatility directly: size positions such that the expected P&L impact of a one-sigma event move stays within a defined risk budget. As implied vol rises before an event, position size automatically shrinks.",
        ],
      },
      {
        heading: "Building an event calendar into your workflow",
        body: [
          "An event calendar is a first-class research tool, not an afterthought. Before entering any position, check whether there are major catalysts in the holding period. Price that risk explicitly into your entry decision.",
          "The most important events to track for equity strategies: earnings (company-specific), FOMC meetings (regime-shifting), CPI and NFP (risk-on/risk-off catalyst), and sector-specific events like drug approval dates for biotech or supply reports for energy.",
        ],
      },
    ],
  },

  {
    slug: "mean-reversion-regime-filter",
    title: "Building a Regime Filter for Mean-Reversion Strategies",
    description:
      "Mean reversion only works in ranging markets. This guide walks through a simple regime detection layer you can bolt onto an existing mean-reversion strategy to cut false signals.",
    category: "Strategy Research",
    publishedAt: "2025-03-19",
    readingTime: "10 min read",
    heroStat: "Regime-filtered entries improve Sharpe ratio by ~0.6 on average",
    keywords: [
      "mean reversion",
      "regime filter",
      "range-bound market",
      "signal filtering",
      "strategy enhancement",
      "Sharpe ratio",
    ],
    sections: [
      {
        heading: "The core problem with mean-reversion strategies",
        body: [
          "Mean-reversion strategies assume that prices will return to some central tendency after deviating from it. This assumption is conditionally true — it holds in range-bound, low-trending environments and fails badly in trending ones.",
          "A mean-reversion strategy running in a trending market is fighting the tape on every trade. It buys dips that become new lows and shorts rallies that become new highs. The losses aren't random; they're systematic and directional. The fix is making the strategy aware of the regime it's operating in.",
        ],
      },
      {
        heading: "Measuring trendiness: the tools",
        body: [
          "The Hurst exponent is a statistical measure of whether a time series is trending (Hurst > 0.5), random (Hurst = 0.5), or mean-reverting (Hurst < 0.5). Calculating a rolling Hurst exponent over a 60-day window gives you a continuous measure of market character that can gate mean-reversion entries.",
          "A simpler proxy is the ADX (Average Directional Index). ADX above 25 typically indicates a trending environment where mean-reversion entries are higher risk. ADX below 20 indicates a ranging environment where mean-reversion strategies operate closer to their theoretical edge.",
          "Bollinger Band width is another option: wide bands indicate trend or high volatility, narrow bands indicate compression and ranging behavior. Restricting mean-reversion entries to periods of compressed band width selects for the environment where the edge is strongest.",
        ],
      },
      {
        heading: "Implementation: a two-layer entry model",
        body: [
          "The base layer is your existing mean-reversion signal — an RSI threshold, a Bollinger Band touch, a z-score extreme. This signal fires whenever price deviates far enough from the mean.",
          "The filter layer checks whether the current regime is compatible with a mean-reversion trade. Define your regime condition: ADX below 22, Hurst below 0.48, or Bollinger Band width below the 30th percentile of the past year. Only take the base signal when the filter condition is met.",
          "The combined entry rate will be lower — you'll take fewer trades. But the quality of the trades you do take should be meaningfully higher, and the strategy should exhibit fewer sustained drawdowns during trending markets.",
        ],
      },
      {
        heading: "Backtesting the filter",
        body: [
          "Test the strategy in three configurations: no filter, filter only (trades taken when regime says yes, regardless of mean-reversion signal), and the combined model. The no-filter version establishes your baseline. The filter-only version confirms the regime classifier has some predictive value. The combined model shows the benefit of the interaction.",
          "Pay attention to how the filter performs across different historical regimes. A good filter should show consistent improvement across the full sample, not just improvement in one sub-period that washes out in another.",
        ],
      },
    ],
  },

  {
    slug: "position-sizing-under-uncertainty",
    title: "Position Sizing When You Don't Trust the Signal",
    description:
      "Kelly criterion assumes perfect edge estimation. In practice, edge is uncertain. Learn how fractional Kelly, volatility targeting, and regime-aware sizing change your risk profile.",
    category: "Risk Management",
    publishedAt: "2025-04-02",
    readingTime: "7 min read",
    heroStat: "Half-Kelly reduces ruin probability by over 60% vs full-Kelly sizing",
    keywords: [
      "position sizing",
      "Kelly criterion",
      "volatility targeting",
      "risk management",
      "fractional Kelly",
      "edge estimation",
    ],
    sections: [
      {
        heading: "The Kelly problem in practice",
        body: [
          "The Kelly criterion gives the theoretically optimal bet size to maximize long-run geometric growth. The formula is simple: edge divided by odds. The problem is that edge in financial markets is never known with certainty — it's estimated from noisy historical data.",
          "When you input an edge estimate that is higher than the true edge, Kelly prescribes a position size that is too large. The result is a trajectory that underperforms even a smaller, more conservative sizing approach. Full Kelly is optimal only when your edge estimate is exactly right. Since it never is, full Kelly is almost always wrong.",
        ],
      },
      {
        heading: "Fractional Kelly: the practical standard",
        body: [
          "Fractional Kelly — typically half-Kelly or quarter-Kelly — accepts lower expected growth in exchange for dramatically lower variance and drawdown risk. At half-Kelly, you capture roughly 75% of the maximum growth rate while reducing drawdowns by more than half.",
          "The intuition is simple: if your edge estimate is off by a factor of two, half-Kelly with the true edge produces the same result as full Kelly with a correctly estimated edge. You've built in a margin of safety against your own uncertainty.",
        ],
      },
      {
        heading: "Volatility targeting as an alternative framework",
        body: [
          "Volatility targeting sidesteps edge estimation entirely. Instead of asking 'how large should this position be given my edge,' it asks 'how large should this position be given my risk budget and the current volatility of the instrument?'",
          "A volatility-targeted portfolio maintains constant expected daily P&L volatility by scaling positions inversely to realized volatility. When volatility is high, positions shrink. When volatility is low, they expand. The result is a more consistent risk profile across different market environments.",
        ],
      },
      {
        heading: "Regime-aware sizing: combining both frameworks",
        body: [
          "The most robust approach combines both frameworks with a regime overlay. Base position size on volatility targeting. Apply a fractional Kelly multiplier based on estimated edge conviction. Then apply a regime multiplier that reduces size in environments historically adverse to the strategy.",
          "This three-layer model means that no single piece of bad information — a wrong edge estimate, a volatility spike, or a regime shift — can produce a catastrophic position size. The layers of uncertainty are each handled by a separate component of the sizing model.",
        ],
      },
    ],
  },

  {
    slug: "volatility-regimes-vix-alternatives",
    title: "Beyond the VIX: Better Ways to Measure Volatility Regime",
    description:
      "The VIX is a blunt instrument. Realized volatility, volatility of volatility, and term structure slope give a richer picture of where fear actually lives in the market.",
    category: "Regime Analysis",
    publishedAt: "2025-04-16",
    readingTime: "8 min read",
    heroStat: "VVIX leads VIX regime shifts by an average of 2–3 sessions",
    keywords: [
      "VIX",
      "volatility regime",
      "VVIX",
      "realized volatility",
      "implied volatility",
      "term structure",
      "regime detection",
    ],
    sections: [
      {
        heading: "What the VIX actually measures",
        body: [
          "The VIX measures the 30-day implied volatility of S&P 500 options. It is a forward-looking estimate of expected market volatility derived from options prices. What it is not is a real-time measure of current market stress, a leading indicator of regime change, or a reliable measure of volatility in individual stocks or other asset classes.",
          "The VIX is useful but overused. Traders treat it as a universal fear gauge when it is really a single data point about one segment of the market. Understanding its limitations is the first step toward building a richer volatility picture.",
        ],
      },
      {
        heading: "Realized volatility: what's actually happening",
        body: [
          "Realized volatility — calculated from actual historical returns — measures what the market has done, not what it's expected to do. The ratio of implied to realized volatility (the variance risk premium) is itself a signal: a high ratio suggests the market is paying a premium for protection, which has historically been a mean-reversion indicator.",
          "For regime classification, compare 5-day realized volatility to 20-day realized volatility. When short-term realized vol is rising relative to medium-term, the market is in a volatility acceleration phase. When it's falling, volatility is compressing — often a precursor to a directional move.",
        ],
      },
      {
        heading: "The VVIX: volatility of volatility",
        body: [
          "The VVIX measures implied volatility on VIX options — essentially, how much the market expects the VIX itself to move. It is a second-order fear measure that tends to spike before the VIX itself moves significantly.",
          "Historically, spikes in the VVIX have preceded major VIX regime shifts by two to three sessions. Monitoring the VVIX alongside the VIX gives you an early warning signal for volatility regime transitions rather than a contemporaneous one.",
        ],
      },
      {
        heading: "Term structure as a regime signal",
        body: [
          "The VIX term structure — the relationship between short-dated and long-dated implied volatility — is one of the most reliable regime indicators available. In normal markets, the term structure is upward sloping: longer-dated uncertainty costs more than shorter-dated. When the term structure inverts, short-dated fear exceeds long-dated expectation, which is a historically reliable signal of near-term risk-off behavior.",
          "Combining term structure shape with VIX level and VVIX creates a three-dimensional volatility regime picture that is significantly more informative than any single measure alone.",
        ],
      },
    ],
  },

  {
    slug: "systematic-vs-discretionary",
    title: "Systematic vs. Discretionary: A False Dichotomy",
    description:
      "The best traders don't choose between rules and judgment — they use systematic research to inform discretionary decisions. Here's how to build a workflow that combines both.",
    category: "Research Workflow",
    publishedAt: "2025-05-01",
    readingTime: "6 min read",
    heroStat: "Hybrid approaches outperform pure systematic in low-data, fast-changing regimes",
    keywords: [
      "systematic trading",
      "discretionary trading",
      "hybrid approach",
      "research workflow",
      "quant",
      "trading strategy",
    ],
    sections: [
      {
        heading: "The false choice",
        body: [
          "The trading world tends to divide into two camps: systematic traders who follow rules without exception and discretionary traders who rely on judgment and pattern recognition. Both camps have produced exceptional traders. Both camps have also produced spectacular blowups.",
          "The dichotomy is largely false. The most sophisticated systematic traders exercise discretion in strategy selection, parameter choices, and risk management. The most rigorous discretionary traders use quantitative tools to structure their analysis and validate their intuitions. The question is not whether to use rules or judgment but how to combine them intelligently.",
        ],
      },
      {
        heading: "What systematic does well",
        body: [
          "Systematic approaches excel at removing emotional bias from execution. Once a signal fires, the trade is taken — no second-guessing, no hesitation, no overriding based on recent losses. This consistency is enormously valuable in strategies where emotional interference is the primary source of underperformance.",
          "Systematic approaches also scale efficiently. A rule-based strategy can run across hundreds of instruments simultaneously without additional cognitive load. Discretionary trading is inherently bottlenecked by the trader's attention and processing capacity.",
        ],
      },
      {
        heading: "What discretion does well",
        body: [
          "Discretionary judgment is most valuable in low-data environments where historical patterns are sparse and regime context is ambiguous. A geopolitical event with no historical precedent, a central bank that changes its communication style, a new asset class with limited trading history — these situations require judgment that systematic models cannot reliably provide.",
          "Experienced discretionary traders also develop intuitions about market microstructure and participant behavior that are difficult to quantify but genuinely predictive. The challenge is distinguishing real pattern recognition from narrative rationalization.",
        ],
      },
      {
        heading: "Building the hybrid workflow",
        body: [
          "The practical hybrid workflow uses systematic tools for research, screening, and risk management, while preserving discretionary judgment for trade selection and sizing within the opportunity set the system surfaces.",
          "Systematic tools handle: regime classification, opportunity scanning, signal generation, position sizing constraints, and risk monitoring. Discretion handles: which opportunities within the system's output to prioritize, when regime classifications feel uncertain, and how to manage tail events that fall outside the system's design parameters.",
        ],
      },
    ],
  },

  {
    slug: "live-vs-backtest-performance-gap",
    title: "The Live vs. Backtest Performance Gap — and How to Shrink It",
    description:
      "Strategies that looked great in backtests routinely underperform live. This breakdown covers the main culprits — slippage, overfitting, and regime shift — and what to do about each.",
    category: "Backtesting",
    publishedAt: "2025-05-15",
    readingTime: "9 min read",
    heroStat: "Average live underperformance vs backtest: 35–55% of expected alpha",
    keywords: [
      "backtest performance",
      "live trading",
      "slippage",
      "overfitting",
      "strategy decay",
      "implementation shortfall",
    ],
    sections: [
      {
        heading: "Why the gap exists",
        body: [
          "The live vs. backtest performance gap is one of the most consistent findings in quantitative trading. Strategies almost always perform worse live than they did in backtesting. The gap is rarely catastrophic — most strategies still work, just less well than expected — but it is almost universal.",
          "Understanding the sources of the gap lets you address them systematically during strategy development rather than discovering them after deployment. Each source has a different cause and a different fix.",
        ],
      },
      {
        heading: "Source 1: Transaction costs and slippage",
        body: [
          "Transaction costs are the most mechanical source of the gap and the easiest to model correctly. Commissions are straightforward. Slippage — the difference between the price at which a signal fires and the price at which the trade executes — is harder.",
          "For liquid large-cap instruments, assume 0.05–0.10% slippage per side as a baseline. For less liquid instruments, assume more — potentially much more for larger position sizes. If your strategy's edge disappears after including realistic slippage estimates, the edge was an artifact of the idealized backtest environment.",
        ],
      },
      {
        heading: "Source 2: Overfitting and parameter decay",
        body: [
          "Parameters optimized on historical data capture historical patterns, not future ones. As markets evolve, the parameter values that were optimal for the past become less appropriate for the present. The more tightly a strategy's parameters are fit to historical data, the faster they decay.",
          "The fix is not to avoid optimization — it's to regularize it. Use parameter ranges rather than point estimates. Prefer parameters that perform consistently across a range of values over those that peak sharply. Accept lower in-sample performance in exchange for greater robustness.",
        ],
      },
      {
        heading: "Source 3: Regime shift",
        body: [
          "Many strategies are implicitly regime-specific. A strategy developed on data from 2010 to 2020 — a decade of low volatility, low rates, and persistent equity momentum — may not be calibrated for high-volatility, high-rate, or regime-uncertain environments.",
          "The solution is explicit regime testing during development: run the strategy on sub-periods that represent different regimes and verify that performance is at least acceptable across all of them, not just strong in aggregate.",
        ],
      },
      {
        heading: "Shrinking the gap: practical steps",
        body: [
          "Use conservative transaction cost assumptions — err toward overestimating costs, not underestimating them. Apply walk-forward validation to catch parameter decay before deployment. Test across multiple historical regimes. Set live performance monitoring thresholds based on historical drawdown distributions so you can detect underperformance early.",
          "Finally, accept that some gap is inevitable. The goal is not to eliminate it but to reduce it to a level where live performance is still meaningfully positive, and to build monitoring systems that tell you quickly when the gap is widening beyond expectations.",
        ],
      },
    ],
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAllPosts(): BlogPost[] {
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
