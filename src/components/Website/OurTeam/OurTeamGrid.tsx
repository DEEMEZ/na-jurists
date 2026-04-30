"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { WebsiteTeamPublicMember } from "@/lib/websiteTeamDefaults";
import { resolveTeamAvatar, type TeamAvatarSrc } from "@/components/Website/OurTeam/teamImageMap";

type GridMember = {
  id: string;
  name: string;
  title: string;
  avatarSrc: TeamAvatarSrc;
  fullBio: string;
  delay: number;
};

const CloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-gray-600 transition-colors hover:text-gray-800"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
};

export function OurTeamGrid({ members }: { members: WebsiteTeamPublicMember[] }) {
  const mapped = useMemo<GridMember[]>(
    () =>
      members.map((m) => ({
        id: m.id,
        name: m.name,
        title: m.title,
        avatarSrc: resolveTeamAvatar(m.photoUrl, m.imageKey),
        fullBio: m.bio,
        delay: m.delayMs,
      })),
    [members],
  );

  const [active, setActive] = useState<GridMember | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActive(null);
      }
    };

    if (active) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [active]);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const visible = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;

        if (visible && !sectionRef.current.classList.contains("opacity-100")) {
          setIsVisible(true);
          sectionRef.current.classList.add("opacity-100");
          sectionRef.current.classList.remove("opacity-0", "translate-y-10");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {active && (
        <>
          <div
            className={`fixed inset-0 z-[90] bg-black/30 transition-opacity duration-300 ${
              active ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6 md:p-8">
            <div
              ref={modalRef}
              className={`relative flex max-h-[95vh] w-full max-w-[500px] transform flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 sm:rounded-3xl ${
                active ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <button
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:bg-gray-50"
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
              <div className="flex flex-shrink-0 justify-center bg-gradient-to-br from-[#f0f4f8] to-[#d9e2ec] p-4 sm:p-6 md:p-8">
                <div className="relative flex h-32 w-32 transform items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg transition-transform duration-200 hover:scale-105 sm:h-36 sm:w-36 md:h-40 md:w-40">
                  {active.avatarSrc ? (
                    <Image
                      src={active.avatarSrc}
                      alt={active.name}
                      fill
                      className="scale-110 object-cover object-top"
                      style={{ objectPosition: "50% 20%" }}
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2c415e] to-[#4a6789]" />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 pb-6 sm:p-5 sm:pb-8 md:p-6">
                <div className="mb-4 text-center sm:mb-5 md:mb-6">
                  <h3 className="mb-2 text-xl font-bold text-[#2c415e] sm:text-2xl">{active.name}</h3>
                  <p className="text-base font-medium text-[#4a6789] sm:text-lg">{active.title}</p>
                </div>

                <div className="relative">
                  <div className="pr-2 text-sm leading-relaxed text-[#666b6f]">
                    <p className="mb-4">{active.fullBio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <section id="our-team" className="relative py-16">
        <div
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div
            ref={sectionRef}
            className="translate-y-10 transform rounded-xl bg-white p-8 opacity-0 shadow-lg transition-all duration-1000 md:p-12"
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-[#2c415e]">Our Team</h2>
              <div className="mx-auto h-1 w-24 bg-[#2c415e]" />
              <p className="mx-auto mt-4 max-w-3xl text-[#666b6f]">
                Meet the dedicated professionals at N&A Jurists, committed to delivering exceptional legal
                expertise with integrity.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mapped.map((member) => (
                <div
                  key={member.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActive(member)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActive(member);
                    }
                  }}
                  className={`group cursor-pointer transform rounded-lg border border-[#e5eaf4] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#a7c1d9] hover:shadow-lg ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${member.delay}ms` : "0ms",
                  }}
                >
                  <div className="mb-4 flex justify-center">
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-200 shadow-md transition-transform duration-200 group-hover:scale-105">
                      {member.avatarSrc ? (
                        <Image
                          src={member.avatarSrc}
                          alt={member.name}
                          fill
                          className="scale-110 object-cover object-top"
                          style={{ objectPosition: "50% 20%" }}
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-20 w-20 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2c415e] to-[#4a6789]" />
                    </div>
                  </div>

                  <h3 className="mb-1 text-center text-lg font-semibold text-[#2c415e] transition-colors group-hover:text-[#1a2a3e]">
                    {member.name}
                  </h3>
                  <p className="mb-3 text-center font-medium text-[#4a6789]">{member.title}</p>

                  <div className="text-center text-sm text-[#666b6f]">
                    <p className="line-clamp-3">
                      {member.fullBio.length > 120
                        ? `${member.fullBio.substring(0, 120)}...`
                        : member.fullBio}
                    </p>
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-xs text-[#4a6789] opacity-70 transition-opacity group-hover:opacity-100">
                      Click to read more
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
