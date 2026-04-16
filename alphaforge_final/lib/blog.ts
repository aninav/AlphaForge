export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  category: string
  keywords: string[]
  readingTime: string
  heroStat: string
  sections: Array<{
    heading: string
    body: string[]
  }>
}

export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-a-systematic-trading-terminal",
    title: "What a systematic trading terminal should actually help you decide",
    description:
      "A practical guide to using a research terminal for market regime analysis, strategy validation, and faster portfolio decisions.",
    publishedAt: "2026-04-08",
    updatedAt: "2026-04-12",
    category: "Research Workflow",
    keywords: [
      "systematic trading terminal",
      "quant research platform",
      "market regime analysis",
      "strategy backtesting",
      "portfolio research tools",
    ],
    readingTime: "5 min read",
    heroStat: "3 workflow layers",
    sections: [
      {
        heading: "A terminal should compress research, not just display charts",
        body: [
          "Most trading dashboards stop at visualization. A research terminal should take the next step and help you connect regime context, signal logic, and execution assumptions in one place.",
          "AlphaForge is designed for that higher-leverage workflow. You can inspect the market environment, test a rules-based idea, and compare the risk profile without jumping between disconnected tools.",
        ],
      },
      {
        heading: "The workflow starts with regime awareness",
        body: [
          "A strategy can look strong in aggregate and still fail when volatility or trend conditions change. Regime-aware research makes it easier to see whether performance is durable or just lucky exposure to one market phase.",
          "That is why the AlphaForge terminal surfaces trend state, volatility percentile, and signal posture together instead of burying them behind separate views.",
        ],
      },
      {
        heading: "Backtests need decision-grade clarity",
        body: [
          "A useful backtest is not just a CAGR figure. You need turnover, drawdown shape, trade distribution, and enough date context to understand what actually happened.",
          "Clean chronology, readable timestamps, and consistent parameter controls matter because they reduce misreads and make it easier to trust what you are seeing.",
        ],
      },
    ],
  },
  {
    slug: "how-to-evaluate-market-regimes-before-you-backtest",
    title: "How to evaluate market regimes before you backtest a strategy",
    description:
      "Learn how to frame trend, volatility, and event context before you commit to a backtest so your results are easier to interpret.",
    publishedAt: "2026-04-10",
    updatedAt: "2026-04-14",
    category: "Market Regimes",
    keywords: [
      "evaluate market regimes",
      "trend and volatility analysis",
      "systematic strategy testing",
      "quant regime filters",
      "event-driven volatility",
    ],
    readingTime: "6 min read",
    heroStat: "Trend + vol + events",
    sections: [
      {
        heading: "Start with the environment, not the indicator",
        body: [
          "When teams skip regime analysis, they often overfit a signal to a period that happened to be friendly for that logic. Starting with the environment creates a better baseline for evaluation.",
          "A simple framing question helps: is this market trending, mean-reverting, or digesting elevated volatility around an event cluster?",
        ],
      },
      {
        heading: "Separate structural conditions from one-off noise",
        body: [
          "Macro events can distort returns over short windows. Folding event timing into your research helps you tell the difference between persistent behavior and a temporary shock.",
          "That is especially useful when you are comparing a strategy across multiple ETFs or trying to understand why a parameter set breaks after a policy headline.",
        ],
      },
      {
        heading: "Use the same date language everywhere",
        body: [
          "One underrated source of confusion in terminals is inconsistent date presentation. If date inputs, chart labels, and live signals all speak slightly different formats, users hesitate.",
          "Standardized, high-contrast date labels remove that friction and make the research loop feel more trustworthy.",
        ],
      },
    ],
  },
  {
    slug: "seo-and-content-for-fintech-product-launches",
    title: "SEO and content structure for a fintech product launch page",
    description:
      "A blueprint for landing pages and blogs that explain a fintech product clearly while giving search engines crawlable, structured content.",
    publishedAt: "2026-04-14",
    category: "Growth",
    keywords: [
      "fintech landing page seo",
      "blog seo for saas",
      "technical product marketing",
      "search engine optimization for fintech",
      "content strategy for trading software",
    ],
    readingTime: "4 min read",
    heroStat: "Intent-led content",
    sections: [
      {
        heading: "A hero section is not enough",
        body: [
          "If the only thing above the fold is a logo and a button, visitors have to guess what the product does. Search engines have the same problem.",
          "A stronger landing page explains audience, workflow, features, and outcomes in a scrollable structure with clear internal links.",
        ],
      },
      {
        heading: "Blogs create topical depth and internal linking",
        body: [
          "A blog index and article pages let you target specific search intent around strategy research, market regimes, and quant workflows while reinforcing the product narrative.",
          "That content also supports better metadata, richer snippets, and more pathways into high-intent product pages.",
        ],
      },
      {
        heading: "Metadata should mirror the real product story",
        body: [
          "Strong SEO starts with clean page titles, descriptions, canonical paths, and structured content. It works best when the copy accurately reflects the experience users will see once they enter the product.",
          "Landing page messaging and product UI should feel like one system rather than separate marketing and app voices.",
        ],
      },
    ],
  },
]

export function getAllPosts() {
  return [...blogPosts].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
