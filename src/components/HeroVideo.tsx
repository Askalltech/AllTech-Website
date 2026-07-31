"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";

/**
 * The video panel from the shadcnblocks Hero76 block, pulled out on its
 * own rather than adopting the whole block.
 *
 * Hero76 is a full two-column hero (badge, heading, description, buttons,
 * a small logo marquee, then this video panel) built for a generic SaaS
 * page. The homepage's hero copy, buttons, and trust row already exist as
 * plain Astro/HTML using the site's own `.btn`/`.eyebrow` classes, and a
 * second logo marquee would duplicate the real one already lower on the
 * page (ClientLogos.astro). Rewriting all of that as React just to get a
 * video panel would mean re-styling every button and losing the plain-CSS
 * hero for no reason, so this component is only the part that actually
 * needs client interactivity: the play/pause state on the video itself.
 * Everything else in the hero stays static Astro, unchanged.
 *
 * `videoSrc` isn't set to anything by default — see index.astro for
 * where the real file goes.
 */

interface HeroVideoProps {
  videoSrc?: string;
  className?: string;
}

const HeroVideo = ({ videoSrc }: HeroVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    void videoRef.current?.play();
  };

  return (
    <div className="relative z-0 w-full min-w-0">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-16 -left-[55%] z-0 w-[calc(55%+12rem)] md:-left-[62%] md:w-[calc(62%+14rem)]"
      >
        <div
          className="absolute inset-0 opacity-35 dark:opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, var(--color-bg-page) 0%, color-mix(in oklab, var(--color-bg-page) 25%, transparent) 22%, transparent 58%)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-28"
          style={{ background: "linear-gradient(to bottom, var(--color-bg-page), transparent)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{ background: "linear-gradient(to top, var(--color-bg-page), transparent)" }}
        />
      </div>

      <div
        className="relative z-10 overflow-hidden rounded-xl md:rounded-2xl"
        style={{ border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
      >
        <AspectRatio ratio={16 / 9}>
          {videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              playsInline
              preload="metadata"
              loop
              className="size-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </AspectRatio>
        {videoSrc && !isPlaying && (
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label="Play video"
            className="absolute top-1/2 left-1/2 z-20 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition hover:brightness-105 md:size-16"
            style={{ background: "var(--color-amber-400)" }}
          >
            <Play className="size-6 fill-[var(--color-ink-950)] stroke-[var(--color-ink-950)] md:size-7" />
          </button>
        )}
      </div>
    </div>
  );
};

export { HeroVideo };
