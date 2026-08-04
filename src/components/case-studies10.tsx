"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { cn } from "@/lib/utils";

interface CaseStudiesCarouselItem {
  id: string;
  logo: string;
  logoAlt?: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

interface CaseStudiesCarouselProps {
  title: string;
  description: string;
  items: CaseStudiesCarouselItem[];
  className?: string;
}

interface CaseStudies10Props extends CaseStudiesCarouselProps {}
type Props = Partial<CaseStudies10Props>;

const defaultProps: CaseStudies10Props = {
  title: "Case studies",
  description:
    "A horizontal carousel of customer stories with full-bleed imagery, company logos, short summaries, and links to read the full write-up.",
  items: [
    {
      id: "pipeline-analytics",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-1.svg",
      logoAlt: "Northwind Analytics",
      title: "Unified pipeline analytics in a single view",
      description:
        "How a revenue team unified CRM data and product telemetry to shorten sales cycles and make forecasting review meetings less painful.",
      href: "#",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/photos3/photo-1-3x4.jpg",
    },
    {
      id: "launch-readiness",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-2.svg",
      logoAlt: "Stacklane",
      title: "Coordinating a multi-team product launch",
      description:
        "Design, engineering, and go-to-market aligned on one timeline with shared blocks and checklists so launch week stayed predictable.",
      href: "#",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/photos3/photo-2-3x4.jpg",
    },
    {
      id: "customer-success",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-3.svg",
      logoAlt: "Railway Apps",
      title: "Scaling onboarding without growing headcount",
      description:
        "Automated nudges and in-app guidance replaced one-off emails while support kept a clear view of who needed a human touch.",
      href: "#",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/photos3/photo-3-3x4.jpg",
    },
    {
      id: "security-review",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-4.svg",
      logoAlt: "CipherTrust",
      title: "Passing enterprise security review faster",
      description:
        "The team turned a checklist-heavy review into a tracked workflow so legal and IT could sign off without thrashing the roadmap.",
      href: "#",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/photos3/photo-4-3x4.jpg",
    },
    {
      id: "design-system",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-5.svg",
      logoAlt: "Glyph Studio",
      title: "One design system across marketing and product",
      description:
        "Shared tokens and documented sections cut duplicate UI work and made brand updates roll out consistently across surfaces.",
      href: "#",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/photos3/photo-5-3x4.jpg",
    },
    {
      id: "revenue-ops",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-6.svg",
      logoAlt: "Cedarline",
      title: "Revenue ops that fits how teams actually work",
      description:
        "Forecasting and pipeline hygiene moved out of spreadsheets into one place so leadership could see risk early without extra ceremony.",
      href: "#",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/photos3/photo-6-3x4.jpg",
    },
  ],
};

const CaseStudies10 = (props: Props) => {
  const { title, description, items, className } = {
    ...defaultProps,
    ...props,
  };

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mb-6 flex items-end justify-between md:mb-9 lg:mb-10">
          <div className="flex flex-col gap-4">
            {title && (
              <h2 className="text-3xl font-medium md:text-4xl lg:text-5xl">
                {title}
              </h2>
            )}
            <p className="max-w-xl text-muted-foreground">{description}</p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="container">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            loop: false,
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_52%,transparent)_34%,color-mix(in_oklab,var(--background)_14%,transparent)_68%,transparent_100%)] transition-opacity duration-300 sm:w-28 md:w-36",
              !canScrollPrev && "opacity-0",
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-[linear-gradient(270deg,var(--background)_0%,color-mix(in_oklab,var(--background)_52%,transparent)_34%,color-mix(in_oklab,var(--background)_14%,transparent)_68%,transparent_100%)] transition-opacity duration-300 sm:w-28 md:w-36",
              !canScrollNext && "opacity-0",
            )}
          />
          <CarouselContent className="-ml-5">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-[85%] pl-5 md:basis-[45%]"
              >
                <a href={item.href} className="group block rounded-xl">
                  <div className="group relative aspect-4/3 w-full max-w-full overflow-hidden rounded-xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 h-full bg-linear-to-t from-black/80 via-black/28 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-white md:p-8">
                      <div className="mb-3 flex h-9 items-center pt-3 md:mb-4">
                        <img
                          src={item.logo}
                          alt={item.logoAlt ?? ""}
                          className="max-h-8 w-auto max-w-[160px] object-contain object-left"
                        />
                      </div>
                      <div className="mb-2 line-clamp-1 text-xl font-semibold md:mb-3 md:text-2xl">
                        {item.title}
                      </div>
                      <div className="mb-8 line-clamp-2 text-sm text-pretty text-white/90 md:mb-10">
                        {item.description}
                      </div>
                      <div className="mt-auto flex items-center text-sm">
                        Read more{" "}
                        <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`h-2 w-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-primary" : "bg-primary/20"
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { CaseStudies10 };
