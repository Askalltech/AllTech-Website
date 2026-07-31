"use client";

import type { COBEOptions } from "cobe";

import { Globe } from "@/components/ui/globe";

/**
 * The interactive globe from the shadcnblocks Hero249 block, used here on
 * its own rather than adopting the whole block (which is a generic
 * "collaborate across timezones" SaaS hero — heading, description, CTA,
 * and a fictional-logo marquee all unrelated to Cloudflare Zero Trust).
 * Only the globe carries over; the markers are Cloudflare's actual global
 * points of presence pattern (a worldwide anycast network), not a claim
 * about AllTech's own footprint, so kept as the original's generic
 * world-city set.
 *
 * Recolored from the block's stock orange to the site's brand blue
 * (--color-amber-400/500, the same tokens .btn-primary uses) so it reads
 * as part of this site rather than a pasted-in block.
 */

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [0, 131 / 255, 179 / 255], // --color-amber-400
  glowColor: [0, 131 / 255, 179 / 255],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
};

const HeroGlobe = () => {
  return (
    <div className="relative min-h-[320px] w-full">
      <Globe config={GLOBE_CONFIG} />
    </div>
  );
};

export { HeroGlobe };
