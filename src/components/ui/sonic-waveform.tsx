"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, BarChart2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Sonic Waveform Canvas Component — draws on a transparent canvas (no fill
// behind it) so the page's own background shows through; older strokes are
// faded via destination-out compositing instead of an opaque overlay rect.
const SonicWaveformCanvas = ({ animate }: { animate: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight ?? window.innerHeight;
    };

    const draw = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      const lineCount = 60;
      const segmentCount = 80;
      const height = canvas.height / 2;

      for (let i = 0; i < lineCount; i++) {
        ctx.beginPath();
        const progress = i / lineCount;
        const colorIntensity = Math.sin(progress * Math.PI);
        ctx.strokeStyle = `rgba(45, 212, 191, ${colorIntensity * 0.55})`;
        ctx.lineWidth = 1.5;

        for (let j = 0; j < segmentCount + 1; j++) {
          const x = (j / segmentCount) * canvas.width;

          // Mouse influence
          const distToMouse = Math.hypot(x - mouse.x, height - mouse.y);
          const mouseEffect = Math.max(0, 1 - distToMouse / 400);

          // Wave calculation
          const noise = Math.sin(j * 0.1 + time + i * 0.2) * 20;
          const spike = Math.cos(j * 0.2 + time + i * 0.1) * Math.sin(j * 0.05 + time) * 50;
          const y = height + noise + spike * (1 + mouseEffect * 2);

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      time += 0.008;
      // Under prefers-reduced-motion, render a single static frame rather
      // than driving an endless rAF loop.
      if (animate) animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    window.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [animate]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-0 h-full w-full" />;
};

export interface SonicWaveformHeroProps {
  eyebrowIcon?: LucideIcon;
  eyebrow: string;
  title: string;
  highlightedTitle?: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  className?: string;
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2 + 0.5,
      duration: 0.8,
      ease: "easeInOut" as const,
    },
  }),
};

// The main hero component — sits on the page's own background (transparent
// wrapper); only the animated waveform and copy render as foreground layers.
const SonicWaveformHero = ({
  eyebrowIcon: EyebrowIcon = BarChart2,
  eyebrow,
  title,
  highlightedTitle,
  description,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  className,
}: SonicWaveformHeroProps) => {
  const shouldReduceMotion = useReducedMotion();

  // The entrance animation is applied ONLY after hydration.
  //
  // This component is prerendered, so `initial="hidden"` used to be baked
  // into the static HTML as opacity:0 — meaning that if this island's JS
  // never ran (blocked, failed, slow), the page's only <h1>, its description,
  // and both CTAs were permanently invisible. Rendering without motion props
  // until mounted means the served HTML is fully visible on its own, and the
  // animation is a progressive enhancement on top.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const animated = hydrated && !shouldReduceMotion;

  /** Motion props for the i-th element, or none when not animating. */
  const anim = (i: number) =>
    animated
      ? { custom: i, variants: fadeUpVariants, initial: 'hidden' as const, animate: 'visible' as const }
      : {};

  return (
    <div className={cn("relative flex w-full flex-col items-center justify-center overflow-hidden", className)}>
      <SonicWaveformCanvas animate={animated} />

      {/* Overlay HTML Content */}
      <div className="relative z-20 p-6 text-center">
        <motion.div
          {...anim(0)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm"
          style={{ borderColor: "var(--color-line-soft)", background: "var(--color-bg-tint)" }}
        >
          <EyebrowIcon className="h-4 w-4" style={{ color: "var(--color-teal-500)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--color-text-default)" }}>
            {eyebrow}
          </span>
        </motion.div>

        <motion.h1
          {...anim(1)}
          className="font-display mb-6 text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
          {highlightedTitle && <span style={{ color: "var(--color-teal-500)" }}> {highlightedTitle}</span>}
        </motion.h1>

        <motion.p
          {...anim(2)}
          className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </motion.p>

        <motion.div
          {...anim(3)}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <a href={primaryCtaHref} className="btn btn-primary">
            {primaryCtaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          {secondaryCtaLabel && (
            <a href={secondaryCtaHref} className="btn btn-ghost">
              {secondaryCtaLabel}
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export { SonicWaveformHero };
export default SonicWaveformHero;
