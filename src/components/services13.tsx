"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Waypoints,
  Network,
  Camera,
  Laptop,
  CloudCog,
  Layers3,
  HardDriveDownload,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// React components can't cross Astro's client-hydration prop boundary, so
// pages pass an icon NAME (matching ~/lib/site.ts's `icon` slugs) and it's
// resolved to a real component from this map — see services21.tsx for the
// same pattern and why it's necessary.
const iconMap = {
  shield: ShieldCheck,
  gateway: Waypoints,
  node: Network,
  camera: Camera,
  endpoint: Laptop,
  "cloud-sync": CloudCog,
  stack: Layers3,
  "disk-recovery": HardDriveDownload,
} satisfies Record<string, LucideIcon>;

export type Services13IconName = keyof typeof iconMap;

export interface Services13PhotoCredit {
  name: string;
  /** Link to the photo's Unsplash page. */
  url: string;
}

export interface Services13Item {
  title: string;
  description: string;
  href: string;
  icon: Services13IconName;
  /** Shows the "Cloudflare Partner" badge, on whichever card this item renders as. */
  featured?: boolean;
  /** Picks which item is the large hero card. Falls back to `featured`, then the first item. */
  hero?: boolean;
  external?: boolean;
  /** Optional photo for the card; falls back to the tinted icon tile without one. */
  image?: string;
  /** Visible credit link shown on the photo, bottom-left, when `image` is set. */
  photoCredit?: Services13PhotoCredit;
}

interface Services13Props {
  services: Services13Item[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  className?: string;
}

/** Small credit link rendered over a card's photo. A real, independently
 * clickable <a> stacked above the card's full-bleed link overlay — not
 * nested inside it, since nested anchors aren't valid HTML. */
const PhotoCredit = ({ credit }: { credit: Services13PhotoCredit }) => (
  <a
    href={credit.url}
    target="_blank"
    rel="noopener noreferrer nofollow"
    className="absolute top-2 left-2 z-20 rounded px-1.5 py-0.5 text-[10px] leading-none text-white/70 transition hover:text-white"
    style={{ background: "rgba(0,0,0,0.35)" }}
    onClick={(e) => e.stopPropagation()}
  >
    Photo: {credit.name}
  </a>
);

const Services13 = ({
  services,
  eyebrow,
  heading = "Featured Services",
  description,
  className,
}: Services13Props) => {
  const explicitHeroIndex = services.findIndex((s) => s.hero);
  const heroIndex =
    explicitHeroIndex >= 0
      ? explicitHeroIndex
      : Math.max(
          0,
          services.findIndex((s) => s.featured),
        );
  const hero = services[heroIndex];
  const rest = services.filter((_, i) => i !== heroIndex);
  const HeroIcon = iconMap[hero.icon];

  return (
    <section className={cn("py-32", className)}>
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col justify-between lg:col-span-1">
          <div>
            {eyebrow && (
              <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {eyebrow}
              </p>
            )}
            <h2 className="mb-4 text-4xl font-medium text-foreground md:text-6xl">
              {heading}
            </h2>
            {description && (
              <p className="w-72 text-base tracking-tight text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
          {/* Featured service — hero card */}
          <motion.div
            whileHover={{ opacity: 0.85, scale: 1.01 }}
            className="group relative col-span-1 block overflow-hidden rounded-xl sm:col-span-2"
          >
            <a
              href={hero.href}
              target={hero.external ? "_blank" : undefined}
              rel={hero.external ? "noopener noreferrer" : undefined}
              className="absolute inset-0 z-10"
              aria-label={hero.title}
            />
            <Card
              className="relative aspect-[21/9] overflow-hidden border p-0"
              style={{ background: "var(--color-bg-tint)", borderColor: "var(--color-border-default)" }}
            >
              {hero.image ? (
                // The gradient (darkens the lower half so light text stays
                // readable) is a second `background-image` layer on this
                // SAME element, not a separate absolutely-positioned div
                // over an <img> — two independently-composited layers here
                // could show a faint seam where the GPU's raster tiles meet
                // (most visible on a smooth sky/photo, masked on busy ones).
                // One element, one paint, no seam.
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 60%, transparent 100%), url(${hero.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <HeroIcon
                  className="absolute -right-6 -bottom-6 size-40 opacity-15"
                  style={{ color: "var(--color-amber-500)" }}
                  strokeWidth={1}
                  aria-hidden="true"
                />
              )}
              <CardContent className="absolute inset-0 flex flex-col justify-end p-8">
                {hero.featured && (
                  <div
                    className="mb-2 text-xs font-medium tracking-wider uppercase"
                    style={{ color: hero.image ? "var(--color-amber-300)" : "var(--color-amber-600)" }}
                  >
                    Cloudflare Partner
                  </div>
                )}
                <div className="pr-4 text-2xl font-bold" style={{ color: hero.image ? "#fff" : "var(--color-text-primary)" }}>
                  {hero.title}
                </div>
                <p
                  className={cn(
                    "mt-2 max-w-lg pr-4 text-sm leading-relaxed",
                    !hero.image && "text-muted-foreground",
                  )}
                  style={hero.image ? { color: "rgba(255,255,255,0.85)" } : undefined}
                >
                  {hero.description}
                </p>
              </CardContent>
              <ArrowUpRight
                className="absolute top-8 right-8 h-8 w-8 transition-transform group-hover:scale-110"
                style={{ color: hero.image ? "#fff" : "var(--color-amber-600)" }}
              />
            </Card>
            {hero.image && hero.photoCredit && <PhotoCredit credit={hero.photoCredit} />}
          </motion.div>

          {rest.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.href}
                whileHover={{ opacity: 0.85, scale: 1.02 }}
                className="group relative block overflow-hidden rounded-xl"
              >
                <a
                  href={service.href}
                  target={service.external ? "_blank" : undefined}
                  rel={service.external ? "noopener noreferrer" : undefined}
                  className="absolute inset-0 z-10"
                  aria-label={service.title}
                />
                <Card
                  className="relative aspect-[4/5] overflow-hidden border p-0"
                  style={{ background: "var(--color-bg-tint)", borderColor: "var(--color-border-default)" }}
                >
                  {service.image ? (
                    // Single element, single paint — see the matching
                    // comment on the hero card above for why this isn't a
                    // separate <img> + overlay <div>.
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.15) 55%, transparent 100%), url(${service.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <Icon
                      className="absolute -right-4 -bottom-4 size-24 opacity-15"
                      style={{ color: "var(--color-amber-500)" }}
                      strokeWidth={1}
                      aria-hidden="true"
                    />
                  )}
                  <CardContent className="absolute inset-0 flex flex-col justify-end p-6">
                    {service.featured && (
                      <div
                        className="mb-1.5 text-[10px] font-medium tracking-wider uppercase"
                        style={{ color: service.image ? "var(--color-amber-300)" : "var(--color-amber-600)" }}
                      >
                        Cloudflare Partner
                      </div>
                    )}
                    <div className="pr-4 text-lg font-semibold" style={{ color: service.image ? "#fff" : "var(--color-text-primary)" }}>
                      {service.title}
                    </div>
                    <p
                      className={cn(
                        "mt-1.5 pr-4 text-xs leading-relaxed",
                        !service.image && "text-muted-foreground",
                      )}
                      style={service.image ? { color: "rgba(255,255,255,0.85)" } : undefined}
                    >
                      {service.description}
                    </p>
                  </CardContent>
                  <ArrowUpRight
                    className="absolute top-6 right-6 h-6 w-6 transition-transform group-hover:scale-110"
                    style={{ color: service.image ? "#fff" : "var(--color-amber-600)" }}
                  />
                </Card>
                {service.image && service.photoCredit && <PhotoCredit credit={service.photoCredit} />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Services13 };
