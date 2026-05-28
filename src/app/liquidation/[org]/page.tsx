"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Building2, Calendar, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Website/Global/Navbar/Navbar";
import Footer from "@/components/Website/Global/Footer/Footer";

type NewsAlertItem = {
  id: string;
  headline: string;
  organization: string;
  pdf_url: string | null;
  body_text: string | null;
  link_url: string | null;
  published_at: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function OrgNewsPage() {
  const params = useParams() ?? {};
  const orgEncoded = (params.org ?? "") as string;
  const orgName = decodeURIComponent(orgEncoded);

  const [items, setItems] = useState<NewsAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchNews = async () => {
      try {
        const res = await fetch(
          `/api/news-alerts?organization=${encodeURIComponent(orgName)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as { data: NewsAlertItem[] };
        setItems(payload.data ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Failed to load news. Please try again later.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchNews();
    return () => controller.abort();
  }, [orgName]);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/liquidation"
            className="inline-flex items-center gap-1.5 text-sm text-[#2c415e] hover:text-[#4a6789] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All organizations
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c415e] mb-2">{orgName}</h1>
            <p className="text-[#666b6f]">
              Latest news and updates for {orgName}
            </p>
          </div>

          {loading && (
            <div className="text-center py-16">
              <p className="text-[#666b6f]">Loading news…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm px-6 py-16 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-[#2c415e]/30" />
              <p className="text-[#666b6f]">No news alerts yet for this organization.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/liquidation/${orgEncoded}/${item.id}`}
                  className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#2c415e]/10">
                    <FileText className="h-5 w-5 text-[#2c415e]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#2c415e] group-hover:text-[#4a6789] transition-colors line-clamp-2">
                      {item.headline}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#666b6f]">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        {item.organization}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(item.published_at)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 self-center">
                    <span className="rounded-md bg-[#2c415e] px-3 py-1.5 text-xs font-semibold text-white">
                      View
                    </span>
                  </div>
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
