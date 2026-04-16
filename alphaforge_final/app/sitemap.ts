import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    {
      url: "https://alphaforge.ai/",
      lastModified: new Date("2026-04-15"),
    },
    {
      url: "https://alphaforge.ai/blog",
      lastModified: new Date("2026-04-15"),
    },
    ...posts.map((post) => ({
      url: `https://alphaforge.ai/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
    })),
  ];
}
