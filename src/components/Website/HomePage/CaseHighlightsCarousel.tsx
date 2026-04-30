"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Landmark } from "lucide-react";

export type CaseHighlight = {
  name: string;
  details: string;
  /** Optional image path under public/ or imported static asset URL */
  imageSrc?: string | null;
};

/** Replace or extend when the firm provides real highlights (name, details, optional picture). */
const CASE_HIGHLIGHTS: CaseHighlight[] = [
  {
    name: "Case highlights",
    details:
      "Important matters will be showcased here in a carousel. Share the case name, a short summary, and an optional image when ready—we will plug them in without changing the layout.",
    imageSrc: null,
  },
];

const CaseHighlightsCarousel = () => {
  const [index, setIndex] = useState(0);
  const total = CASE_HIGHLIGHTS.length;
  const current = CASE_HIGHLIGHTS[index];

  const go = (delta: number) => {
    setIndex((i) => (i + delta + total) % total);
  };

  if (total === 0) return null;

  return (
    <section className="bg-[#f0f3f6] border-y border-[#e2e8f0] py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 text-[#4a6789] font-semibold text-sm uppercase tracking-wide mb-2">
            <Landmark className="w-4 h-4" />
            Important case highlights
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a2b3d]">
            Notable outcomes
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mt-4" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-[#e2e8f0] overflow-hidden">
          <div className="grid md:grid-cols-5 gap-0">
            <div className="md:col-span-2 relative min-h-[200px] md:min-h-[280px] bg-gradient-to-br from-[#2c415e] to-[#4a6789]">
              {current.imageSrc ? (
                <Image
                  src={current.imageSrc}
                  alt={current.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white/90 text-sm">
                  Optional image
                </div>
              )}
            </div>
            <div className="md:col-span-3 p-6 md:p-10 flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl font-bold text-[#2c415e] mb-4">
                {current.name}
              </h3>
              <p className="text-[#666b6f] leading-relaxed text-base">
                {current.details}
              </p>

              {total > 1 && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#edf2f7]">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="inline-flex items-center gap-2 text-[#2c415e] font-medium hover:text-[#4a6789] transition-colors"
                    aria-label="Previous highlight"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {CASE_HIGHLIGHTS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === index ? "w-8 bg-[#4a6789]" : "w-2 bg-[#cbd5e0]"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="inline-flex items-center gap-2 text-[#2c415e] font-medium hover:text-[#4a6789] transition-colors"
                    aria-label="Next highlight"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseHighlightsCarousel;
