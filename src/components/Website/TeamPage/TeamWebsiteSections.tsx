"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_WEBSITE_TEAM,
  type WebsiteTeamPublicPayload,
} from "@/lib/websiteTeamDefaults";
import TeamLeadership from "@/components/Website/TeamPage/Leadership";
import { OurTeamGrid } from "@/components/Website/OurTeam/OurTeamGrid";

export default function TeamWebsiteSections() {
  const [team, setTeam] = useState<WebsiteTeamPublicPayload>(DEFAULT_WEBSITE_TEAM);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/website-team");
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as WebsiteTeamPublicPayload;
        if (!cancelled) setTeam(data);
      } catch {
        if (!cancelled) setTeam(DEFAULT_WEBSITE_TEAM);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <TeamLeadership founder={team.founder} />
      <OurTeamGrid members={team.members} />
    </>
  );
}
