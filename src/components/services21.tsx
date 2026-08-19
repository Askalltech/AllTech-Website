"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  KeyRound,
  Cable,
  Radio,
  Server,
  Zap,
  Sparkles,
  ListChecks,
  ShieldCheck,
  Mail,
  Radar,
  Eye,
  Target,
  Siren,
  Route,
  Smartphone,
  Globe,
  Lock,
  ShieldAlert,
  Code2,
  Network,
  Wifi,
  Flame,
  GitBranch,
  Headset,
  LifeBuoy,
  Activity,
  Handshake,
  Cloud,
  Fingerprint,
  HardDriveDownload,
  HardDrive,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BorderButton } from "@/components/shadcnblocks/border-button";
import { cn } from "@/lib/utils";

// React components (like icons) can't cross Astro's client-hydration prop
// boundary — they get serialized to JSON and come out the other side as an
// inert object, not a function, which crashes React on mount. Pages pass an
// icon NAME instead, resolved to the real component from this map.
const iconMap = {
  Camera,
  KeyRound,
  Cable,
  Radio,
  Server,
  Zap,
  Sparkles,
  ListChecks,
  ShieldCheck,
  Mail,
  Radar,
  Eye,
  Target,
  Siren,
  Route,
  Smartphone,
  Globe,
  Lock,
  ShieldAlert,
  Code2,
  Network,
  Wifi,
  Flame,
  GitBranch,
  Headset,
  LifeBuoy,
  Activity,
  Handshake,
  Cloud,
  Fingerprint,
  HardDriveDownload,
  HardDrive,
} satisfies Record<string, LucideIcon>;

export type Services21IconName = keyof typeof iconMap;

// Custom hook to get previous value
const usePrevious = <T,>(value: T): T | undefined => {
  const [prev, setPrev] = useState<T | undefined>(undefined);
  const ref = useRef(value);

  useEffect(() => {
    setPrev(ref.current);
    ref.current = value;
  }, [value]);

  return prev;
};

export interface Services21Item {
  /** Decorative superscript shown next to the title, e.g. "01". NOT a slug. */
  id: string;
  /** Primary html id for direct deep-linking, e.g. "cameras". */
  anchorId?: string;
  /** Secondary empty-anchor id kept for legacy external links, e.g. "ddos". */
  aliasId?: string;
  title: string;
  /** Omit for items with no dedicated page — renders with no link/CTA. */
  href?: string;
  /** A single paragraph, or a bullet list when the source content is bulleted. */
  description: string | string[];
  /** Overrides the default "Learn more about {title}" CTA label. */
  ctaLabel?: string;
  icon: Services21IconName;
}

interface Services21Props {
  services: Services21Item[];
  className?: string;
}

const Services21 = ({ services, className }: Services21Props) => {
  const [active, setActive] = useState<number>(0);
  const previousActive = usePrevious(active);
  const activeService = services[active];
  const ActiveIcon = iconMap[activeService.icon];
  const PreviousIcon =
    previousActive !== undefined ? iconMap[services[previousActive].icon] : undefined;

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex w-full flex-col justify-between lg:flex-row lg:gap-20">
          <div className="top-24 h-fit max-h-[calc(100vh-7rem)] w-full space-y-7 overflow-y-auto py-8 lg:sticky lg:max-w-xs">
            <div
              className="relative flex h-56 items-center justify-center overflow-hidden rounded-lg border"
              style={{ background: "var(--color-bg-tint)", borderColor: "var(--color-border-default)" }}
            >
              {PreviousIcon && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PreviousIcon className="size-16" style={{ color: "var(--color-amber-500)" }} strokeWidth={1.5} aria-hidden="true" />
                </div>
              )}
              <motion.div
                initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                key={active}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ActiveIcon className="size-16" style={{ color: "var(--color-amber-500)" }} strokeWidth={1.5} aria-hidden="true" />
              </motion.div>
            </div>
            <p className="font-semibold tracking-tight text-foreground/20 uppercase">
              {activeService.title}
            </p>
            {Array.isArray(activeService.description) ? (
              <ul className="space-y-2 text-sm text-foreground/50">
                {activeService.description.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-current" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-foreground/50">{activeService.description}</p>
            )}
          </div>
          <div className="relative w-full xl:pl-20">
            <ul>
              {services.map((service, index) => (
                <li
                  key={index}
                  id={service.anchorId}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "scroll-mt-24 cursor-pointer border-b border-foreground/20 py-8 text-5xl font-semibold tracking-tight lg:text-7xl",
                  )}
                >
                  {service.aliasId && (
                    <span id={service.aliasId} className="block scroll-mt-24" />
                  )}
                  {service.href ? (
                    <a href={service.href} className="block">
                      <div className={index === active ? "opacity-100" : "opacity-20"}>
                        <span>{service.title}</span>
                        <sup
                          className="align-super text-sm lg:text-3xl"
                          style={{ color: "var(--color-amber-500)" }}
                        >
                          {service.id}
                        </sup>
                      </div>
                    </a>
                  ) : (
                    <div className={index === active ? "opacity-100" : "opacity-20"}>
                      <span>{service.title}</span>
                      <sup
                        className="align-super text-sm lg:text-3xl"
                        style={{ color: "var(--color-amber-500)" }}
                      >
                        {service.id}
                      </sup>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {activeService.href && (
              <BorderButton
                asChild
                className="group mt-10"
                style={{
                  borderColor: "var(--color-amber-400)",
                  background: "color-mix(in oklch, var(--color-amber-400) 10%, transparent)",
                  color: "var(--color-amber-600)",
                }}
              >
                <a href={activeService.href}>
                  {activeService.ctaLabel ?? `Learn more about ${activeService.title}`}{" "}
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                </a>
              </BorderButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Services21 };
