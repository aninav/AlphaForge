import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { formatDateLabel } from "@/lib/date";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://alphaforge.ai/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: "AlphaForge",
    },
    publisher: {
      "@type": "Organization",
      name: "AlphaForge",
    },
    keywords: post.keywords.join(", "),
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/blog"
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-forge-accent transition-colors hover:text-forge-bright"
      >
        Back to blog
      </Link>

      <article className="mt-8 border border-forge-border/80 bg-forge-surface/75 p-8 md:p-12">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-forge-label">
          <span className="text-forge-accent">{post.category}</span>
          <span>{formatDateLabel(post.publishedAt)}</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mt-6 font-serif text-5xl font-bold leading-tight text-forge-bright md:text-6xl">{post.title}</h1>
        <p className="mt-6 text-lg leading-8 text-forge-body">{post.description}</p>

        <div className="mt-10 grid gap-6 border-y border-forge-border/70 py-6 md:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-forge-label">Key signal</p>
            <p className="mt-3 font-serif text-3xl font-bold text-forge-bright">{post.heroStat}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-forge-label">Keywords</p>
            <p className="mt-3 text-sm leading-7 text-forge-body">{post.keywords.join(" · ")}</p>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-3xl font-bold text-forge-bright">{section.heading}</h2>
              <div className="mt-4 space-y-5">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-forge-body">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
