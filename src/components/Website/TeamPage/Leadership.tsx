"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { WebsiteTeamPublicFounder } from "@/lib/websiteTeamDefaults";
import { resolveTeamAvatar } from "@/components/Website/OurTeam/teamImageMap";

export default function TeamLeadership({ founder }: { founder: WebsiteTeamPublicFounder }) {
  const heroSrc = resolveTeamAvatar(founder.photoUrl, founder.imageKey);
  const paragraphs = founder.bio
    .split(/\n\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="relative bg-white py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[#2c415e]">Leadership</h2>
          <div className="mx-auto h-1 w-24 bg-[#2c415e]" />
        </motion.div>

        <div className="overflow-hidden rounded-xl bg-[#f0f3f6] shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-80 lg:h-full lg:min-h-[420px]">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={`${founder.name} — leadership`}
                  fill
                  className="object-cover"
                  style={{ objectPosition: "50% 30%" }}
                  quality={90}
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center bg-[#e2e8f0] text-[#64748b]">
                  Photo unavailable
                </div>
              )}
            </div>

            <div className="p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="mb-2 text-2xl font-bold uppercase tracking-wide text-[#2c415e]">
                  {founder.name}
                </h3>
                <p className="mb-6 font-medium text-[#4a6789]">{founder.title}</p>

                <div className="space-y-4 text-[#666b6f]">
                  {paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
