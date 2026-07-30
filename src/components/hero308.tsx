"use client";
import { Play } from "lucide-react";
import { useRef, useState } from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Hero308Props {
  className?: string;
}

const Hero308 = ({ className }: Hero308Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    void videoRef.current?.play();
  };

  return (
    <section
      className={cn("relative bg-background pb-32 font-sans", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url(https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/grid-1.svg)] mask-[radial-gradient(ellipse_92%_78%_at_50%_28%,#000_32%,transparent_76%)] bg-size-[100%_100%] bg-center bg-no-repeat"
      />
      <div className="relative z-10 container pt-12 md:pt-24">
        <div className="flex flex-col items-center gap-5">
          <h1 className="max-w-[25rem] bg-linear-to-r from-neutral-900 via-neutral-700 to-neutral-800 bg-clip-text py-2 text-center text-4xl leading-[1.1] font-semibold tracking-tighter text-transparent md:max-w-[43.75rem] md:text-6xl lg:max-w-[56.25rem] lg:text-[5rem]">
            Ship enterprise AI workflows without the wait
          </h1>
          <p className="max-w-[22.5rem] text-center text-base text-muted-foreground md:max-w-[35rem] lg:text-lg">
            Connect your stack, define agent behavior in plain language, and
            deploy governed automations across teams in minutes.
          </p>
          <div className="pt-6">
            <Button className="block h-fit w-fit animate-shadow-ping rounded-md border border-neutral-950 bg-[linear-gradient(180deg,var(--color-neutral-600),var(--color-neutral-700),var(--color-neutral-900))] px-6 py-3.5 text-center text-lg text-white">
              <a href="#">Start building</a>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[72rem]">
          <div className="mt-14 flex w-full flex-col items-center rounded-2xl border border-neutral-200 bg-neutral-100 p-3">
            <div className="relative w-full overflow-hidden rounded-t-sm border border-neutral-200 bg-neutral-50">
              <AspectRatio
                ratio={16 / 9}
                className="overflow-hidden rounded-t-sm"
              >
                <div className="relative size-full">
                  <video
                    ref={videoRef}
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/man-1.mp4"
                    muted
                    playsInline
                    preload="metadata"
                    loop
                    className="size-full rounded-t-sm object-cover object-center"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  {!isPlaying && (
                    <Button
                      type="button"
                      onClick={handlePlayClick}
                      size="icon"
                      aria-label="Play video"
                      className="absolute top-1/2 left-1/2 z-30 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-500 shadow-[0_0_0_14px_var(--color-neutral-300)] transition-all hover:bg-neutral-600 hover:shadow-[0_0_0_0px_var(--color-neutral-300)] md:h-14 md:w-14 lg:h-20 lg:w-20"
                    >
                      <div className="m-auto aspect-square w-[45%]">
                        <Play className="h-full! w-full! fill-white stroke-white" />
                      </div>
                    </Button>
                  )}
                </div>
              </AspectRatio>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero308 };
