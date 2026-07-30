"use client";

import { motion } from "framer-motion";
import React, { memo, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Team grid, adapted from the shadcnblocks Team11 block.
 *
 * Four deliberate changes from the original, each because the original assumes
 * something this site does not have:
 *
 * 1. `image` is OPTIONAL. The original hard-requires it and renders a bare
 *    <img>. Nobody on the roster has a headshot yet, so a missing image would
 *    render a broken-image icon on every card. Falls back to the same initials
 *    monogram the rest of the page uses.
 * 2. Each card is a LINK to that person's full bio further down the page. The
 *    original cards go nowhere; the whole point of this page is tile → bio.
 * 3. The highlight rule is amber-to-teal, not the original's
 *    blue/green/yellow, which belongs to no palette on this site.
 * 4. Renders the <ul> only — no section, heading, or container. team.astro
 *    already owns those, and the bios below have to stay in Astro so they
 *    remain static HTML for search engines rather than moving into the island.
 *
 * The framer-motion `layoutId` overlay is kept as-is: it is what makes the
 * highlight glide between cards, and it is the reason this is an island at all.
 * Below md the overlay never renders, so touch users get the plain grid.
 */

export interface TeamGridMember {
  name: string;
  role: string;
  /** Short line shown only on the hovered card. Clamped to two lines. */
  description: string;
  /** Anchor for that person's full bio further down the page. */
  href: string;
  /** Optional headshot. Without one, an initials monogram is shown. */
  image?: string;
  tagline?: string;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

interface TeamMemberCardProps {
  member: TeamGridMember;
  highlighted?: boolean;
}

const TeamMemberCard = memo(
  ({ member, highlighted = false }: TeamMemberCardProps) => {
    return (
      <div
        className={cn(
          "flex flex-col gap-4 px-2 md:px-5 md:pt-8",
          highlighted && "md:py-0 md:pb-4",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2 pt-4 md:flex-row md:items-center",
            !highlighted && "border-b pb-4 md:border-b-2",
          )}
        >
          {member.image ? (
            <img
              src={member.image}
              alt=""
              loading="lazy"
              className="size-full rounded border object-cover md:size-12"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded border font-display text-sm font-bold"
              style={{
                background: "var(--color-bg-tint)",
                color: "var(--color-amber-600)",
                borderColor: "var(--color-border-default)",
              }}
            >
              {initialsOf(member.name)}
            </span>
          )}

          <div className="flex flex-col gap-1 tracking-tight">
            <p className="line-clamp-1 font-display font-semibold">
              {member.name}
            </p>
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {member.role}
            </p>
          </div>
        </div>
        {highlighted && (
          <>
            <span
              className="h-0.5 w-full"
              style={{
                background:
                  "linear-gradient(to right, var(--color-amber-500), var(--color-teal-500))",
              }}
            />
            <p className="line-clamp-2 text-xs">{member.description}</p>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-amber-600)" }}
            >
              Read full bio &darr;
            </span>
          </>
        )}
      </div>
    );
  },
);
TeamMemberCard.displayName = "TeamMemberCard";

interface TeamGridProps {
  members: TeamGridMember[];
  className?: string;
}

const TeamGrid = ({ members, className }: TeamGridProps) => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  return (
    <ul
      onMouseLeave={() => setHoveredMember(null)}
      className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4", className)}
    >
      {members.map((member, index) => (
        <li
          key={`team-member-${index}`}
          onMouseEnter={() => setHoveredMember(index)}
          className="relative"
        >
          <a href={member.href} className="block rounded-2xl">
            <TeamMemberCard member={member} />
          </a>

          {hoveredMember === index && (
            <motion.div
              layoutId="team-member-card"
              transition={{
                layout: { duration: 0.2, type: "spring", bounce: 0.1 },
              }}
              className="pointer-events-none absolute inset-0 z-10 hidden h-max rounded-2xl bg-background shadow-lg md:block"
              style={{ border: "1px solid var(--color-border-default)" }}
            >
              <TeamMemberCard member={member} highlighted />
            </motion.div>
          )}
        </li>
      ))}
    </ul>
  );
};

export { TeamGrid };
