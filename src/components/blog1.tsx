"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Blog1, adapted from the shadcnblocks Blog1 block.
 *
 * The original ships six fictional posts with stock-CDN thumbnails and a
 * category Select that isn't wired to anything. Rebuilt as a real,
 * data-driven grid:
 *
 * 1. `posts` comes from the real blog content collection (see
 *    src/pages/insights/index.astro) instead of hardcoded demo data.
 * 2. The category filter actually filters — client-side state over the
 *    distinct `label`s present in `posts`, not a decorative dropdown.
 * 3. `image` is optional. Only one real post exists right now and it has
 *    no hero image yet, so a missing image falls back to a brand-toned
 *    gradient card instead of a broken <img> or a fake stock photo.
 */

export interface Blog1Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  href: string;
  image?: string;
}

interface Blog1Props {
  posts: Blog1Post[];
  className?: string;
}

const Blog1 = ({ posts, className }: Blog1Props) => {
  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.label))).sort(),
    [posts],
  );
  const [filter, setFilter] = useState<string>("All");

  const visible = filter === "All" ? posts : posts.filter((p) => p.label === filter);

  return (
    <section className={cn("py-16 lg:py-20", className)}>
      <div className="container-wide">
        {categories.length > 1 && (
          <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:gap-6 2xl:grid-cols-3">
          {visible.map((post) => (
            <a
              key={post.id}
              href={post.href}
              className="group flex flex-col justify-between rounded-xl border p-6 transition"
              style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
            >
              <div>
                <div className="flex aspect-3/2 overflow-clip rounded-xl">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full origin-bottom object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center font-display text-sm font-semibold tracking-wide uppercase"
                      style={{
                        background: "linear-gradient(135deg, var(--color-bg-tint) 0%, var(--color-bg-surface) 100%)",
                        color: "var(--color-amber-500)",
                      }}
                    >
                      {post.label}
                    </div>
                  )}
                </div>
              </div>
              <h2
                className="mb-2 line-clamp-3 pt-4 text-lg font-medium break-words md:mb-3 md:text-2xl"
                style={{ color: "var(--color-text-primary)" }}
              >
                {post.title}
              </h2>
              <div className="mb-8 line-clamp-2 text-sm md:mb-9" style={{ color: "var(--color-text-muted)" }}>
                {post.summary}
              </div>
              <div>
                <Badge variant="outline">{post.label}</Badge>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Blog1 };
