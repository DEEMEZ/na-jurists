"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ChevronRight, Newspaper } from "lucide-react";
import Navbar from "@/components/Website/Global/Navbar/Navbar";
import Footer from "@/components/Website/Global/Footer/Footer";

type LiquidationOrg = {
  id: string;
  name: string;
  created_at: string;
};

export default function LiquidationPage() {
  const [orgs, setOrgs] = useState<LiquidationOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchOrgs = async () => {
      try {
        const res = await fetch("/api/liquidation-orgs", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as { data: LiquidationOrg[] };
        setOrgs(payload.data ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Failed to load organizations. Please try again later.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchOrgs();
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c415e] mb-2">Liquidation</h1>
            <p className="text-[#666b6f]">
              Click on an organization to view the latest news and updates.
            </p>
          </div>

          {loading && (
            <div className="text-center py-16">
              <p className="text-[#666b6f]">Loading organizations…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && orgs.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm px-6 py-16 text-center">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-[#2c415e]/30" />
              <p className="text-[#666b6f]">No organizations listed yet. Check back soon.</p>
            </div>
          )}

          {!loading && !error && orgs.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/liquidation/${encodeURIComponent(org.name)}`}
                  className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm transition-all hover:shadow-md hover:border-[#2c415e]/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#2c415e]/10">
                    <Building2 className="h-5 w-5 text-[#2c415e]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#2c415e] group-hover:text-[#4a6789] transition-colors truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-[#666b6f] mt-0.5 flex items-center gap-1">
                      <Newspaper className="h-3 w-3" />
                      View latest news
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#2c415e]/40 group-hover:text-[#2c415e] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
