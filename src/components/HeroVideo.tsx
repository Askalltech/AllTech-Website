/**
 * The video panel from the shadcnblocks Hero76 block, pulled out on its
 * own rather than adopting the whole block.
 *
 * Hero76 is a full two-column hero (badge, heading, description, buttons,
 * a small logo marquee, then this video panel) built for a generic SaaS
 * page. The homepage's hero copy, buttons, and trust row already exist as
 * plain Astro/HTML using the site's own `.btn`/`.eyebrow` classes, and a
 * second logo marquee would duplicate the real one already lower on the
 * page (ClientLogos.astro).
 *
 * Autoplay/loop/muted, no play button — the original block was click-to-play,
 * but the video is meant to run as ambient background motion, not something
 * a visitor operates. No client interactivity left at all, so unlike the
 * first version of this file, it doesn't need to be a React island.
 *
 * `videoSrc` isn't set to anything by default — see index.astro for
 * where the real file goes.
 */

interface HeroVideoProps {
  videoSrc?: string;
  className?: string;
}

const HeroVideo = ({ videoSrc }: HeroVideoProps) => {
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
        <div style={{ aspectRatio: "16 / 9" }}>
          {videoSrc && (
            <video
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="size-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { HeroVideo };
