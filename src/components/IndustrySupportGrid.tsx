"use client";

/* Adapted from a community "logo cloud" block (originally a grid of
   third-party vendor logos — NVIDIA, OpenAI, Supabase, etc. — for a
   different kind of page). AllTech's "Who we support" section isn't a
   partner/vendor showcase, so the swapped-image mechanism is replaced with
   the six client industries this page already describes, using an icon per
   industry instead of a logo image. The interactive hover-tilt/spotlight
   grid mechanics are otherwise unchanged. */

import React, { useRef, useState } from "react";
import {
  Factory,
  HeartPulse,
  Briefcase,
  Building2,
  HandHeart,
  TrendingUp,
  PlusIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface IndustryItem {
  n: string;
  title: string;
  tag: string;
  icon: LucideIcon;
  accent: string;
}

// Colors drawn from the site's own accent tokens (amber/teal family) rather
// than arbitrary brand colors, so the per-card variety stays on-palette.
const INDUSTRIES: IndustryItem[] = [
  { n: "01", title: "Manufacturing", tag: "Production lines that can't stop", icon: Factory, accent: "var(--color-amber-400)" },
  { n: "02", title: "Healthcare", tag: "Patient data, secured", icon: HeartPulse, accent: "var(--color-teal-400)" },
  { n: "03", title: "Professional Services", tag: "The confidentiality clients expect", icon: Briefcase, accent: "var(--color-teal-600)" },
  { n: "04", title: "Multi-Location Organizations", tag: "One standard, every site", icon: Building2, accent: "var(--color-amber-500)" },
  { n: "05", title: "Nonprofits", tag: "Real security on a nonprofit budget", icon: HandHeart, accent: "var(--color-success)" },
  { n: "06", title: "Growing Businesses", tag: "Built to outgrow twice", icon: TrendingUp, accent: "var(--color-teal-500)" },
];

export function IndustrySupportGrid({ className, ...props }: React.ComponentProps<"div">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCoords((prev) => ({ ...prev, opacity: 0 }))}
      className={cn(
        "relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border p-2 shadow-2xl backdrop-blur-xl transition-all duration-700",
        className,
      )}
      style={{
        borderColor: "var(--color-border-default)",
        background: "linear-gradient(to bottom, var(--color-bg-elevated), var(--color-bg-surface), var(--color-bg-tint))",
      }}
      {...props}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="industry-circuit-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--color-border-strong)"
              strokeWidth="0.75"
              strokeDasharray="2 4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#industry-circuit-pattern)" />
      </svg>

      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-700 ease-out"
        style={{
          opacity: coords.opacity,
          background: `radial-gradient(500px circle at ${coords.x}px ${coords.y}px, rgba(120, 120, 120, 0.08), transparent 75%)`,
        }}
      />

      <div
        className="relative grid grid-cols-1 divide-x divide-y rounded-[20px] border backdrop-blur-md sm:grid-cols-2 lg:grid-cols-3"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        {INDUSTRIES.map((item) => (
          <IndustryCard key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}

function IndustryCard({ item }: { item: IndustryItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTilt({ rx: ((y - centerY) / centerY) * -7, ry: ((x - centerX) / centerX) * 7 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ perspective: "800px", ["--card-accent" as string]: item.accent }}
      className="group relative flex h-40 flex-col items-center justify-between p-4.5 select-none md:h-48"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(160px circle at ${mousePos.x}px ${mousePos.y}px, color-mix(in srgb, ${item.accent} 22%, transparent), transparent 80%)`,
        }}
      />

      <div className="pointer-events-none absolute -right-[9px] -bottom-[9px] z-30 flex items-center justify-center">
        <PlusIcon
          className="size-4 transition-all duration-500 ease-out"
          style={{
            color: isHovered ? "var(--card-accent)" : "var(--color-border-strong)",
            transform: isHovered ? "rotate(90deg) scale(1.25)" : "none",
          }}
          strokeWidth={2}
        />
      </div>

      <div className="z-10 flex w-full items-center justify-between">
        <span
          className="font-mono text-[9px] font-medium tracking-widest opacity-60 transition-all duration-300 group-hover:opacity-100"
          style={{ color: isHovered ? "var(--card-accent)" : "var(--color-text-muted)" }}
        >
          {item.n} // INDUSTRY
        </span>
      </div>

      <div
        style={{
          transform: isHovered
            ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(16px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        }}
        className="pointer-events-none relative z-10 my-auto flex flex-col items-center justify-center gap-2"
      >
        <Icon
          className="size-7 transition-all duration-300 ease-out group-hover:scale-110 md:size-8"
          style={{ color: isHovered ? "var(--card-accent)" : "var(--color-text-muted)" }}
          strokeWidth={1.5}
        />
        <span
          className="text-center text-xs font-semibold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {item.title}
        </span>
      </div>

      <div className="z-10 flex w-full items-center justify-center overflow-hidden text-center">
        <span
          className="font-mono text-[10px] tracking-tight transition-all duration-300 ease-out"
          style={{
            color: "var(--card-accent)",
            transform: isHovered ? "translateY(0)" : "translateY(0.5rem)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          {item.tag}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
    </div>
  );
}

export default IndustrySupportGrid;
