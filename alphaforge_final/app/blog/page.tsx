import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { formatDateLabel } from "@/lib/date";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read AlphaForge articles on systematic trading workflows, market regime analysis, strategy backtesting, and fintech SEO content.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-forge-accent">AlphaForge Blog</p>
        <h1 className="mt-4 font-serif text-6xl font-bold tracking-tight text-forge-bright">Search-friendly content for systematic research teams</h1>
        <p className="mt-6 text-lg leading-8 text-forge-body">
          Articles on strategy research, market regimes, product storytelling, and the workflows that help trading platforms earn trust.
        </p>
      </div>

      <div className="mt-12 grid gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group grid gap-5 border border-forge-border/80 bg-forge-surface/75 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-forge-accent/60 md:grid-cols-[180px_1fr_auto]"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-forge-accent">{post.category}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-forge-label">{formatDateLabel(post.publishedAt)}</p>
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold text-forge-bright">{post.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-forge-body">{post.description}</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-forge-label">{post.heroStat}</p>
            </div>

            <div className="flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-forge-text">
              {post.readingTime}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
