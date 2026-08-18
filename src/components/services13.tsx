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
  /** Optional photo for the hero card; falls back to the tinted icon tile without one. */
  image?: string;
}

interface Services13Props {
  services: Services13Item[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  className?: string;
}

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
          <motion.a
            href={hero.href}
            target={hero.external ? "_blank" : undefined}
            rel={hero.external ? "noopener noreferrer" : undefined}
            whileHover={{ opacity: 0.85, scale: 1.01 }}
            className="group col-span-1 block overflow-hidden rounded-xl sm:col-span-2"
          >
            <Card
              className="relative aspect-[21/9] overflow-hidden border p-0"
              style={{ background: "var(--color-bg-tint)", borderColor: "var(--color-border-default)" }}
            >
              {hero.image ? (
                <>
                  <img
                    src={hero.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Darkens the photo's lower half so light text stays readable
                      regardless of how bright the source image is. */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 60%, transparent 100%)" }}
                  />
                </>
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
          </motion.a>

          {rest.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.a
                key={service.href}
                href={service.href}
                target={service.external ? "_blank" : undefined}
                rel={service.external ? "noopener noreferrer" : undefined}
                whileHover={{ opacity: 0.85, scale: 1.02 }}
                className="group block overflow-hidden rounded-xl"
              >
                <Card
                  className="relative aspect-[4/5] overflow-hidden border p-0"
                  style={{ background: "var(--color-bg-tint)", borderColor: "var(--color-border-default)" }}
                >
                  {service.image ? (
                    <>
                      <img
                        src={service.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.15) 55%, transparent 100%)" }}
                      />
                    </>
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
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Services13 };
