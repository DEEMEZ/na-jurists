"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Building2, Calendar, ArrowLeft, ExternalLink, Download } from "lucide-react";
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

export default function NewsDetailPage() {
  const params = useParams() ?? {};
  const orgEncoded = (params.org ?? "") as string;
  const id = (params.id ?? "") as string;

  const [item, setItem] = useState<NewsAlertItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/news-alerts/${id}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as { data: NewsAlertItem };
        setItem(payload.data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Failed to load this news item. Please try again later.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchItem();
    return () => controller.abort();
  }, [id]);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link
            href={`/liquidation/${orgEncoded}`}
            className="inline-flex items-center gap-1.5 text-sm text-[#2c415e] hover:text-[#4a6789] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {decodeURIComponent(orgEncoded)}
          </Link>

          {loading && (
            <div className="text-center py-16">
              <p className="text-[#666b6f]">Loading…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && !item && (
            <div className="bg-white rounded-lg shadow-sm px-6 py-16 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-[#2c415e]/30" />
              <p className="text-[#666b6f]">News item not found.</p>
            </div>
          )}

          {!loading && !error && item && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-[#2c415e] leading-snug">
                  {item.headline}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[#666b6f]">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 shrink-0" />
                    {item.organization}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {formatDate(item.published_at)}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {item.body_text && (
                  <div>
                    <p className="text-[#2d3748] leading-relaxed whitespace-pre-wrap">
                      {item.body_text}
                    </p>
                  </div>
                )}

                {item.link_url && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#666b6f] mb-2">
                      Related Link
                    </p>
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#2c415e]/20 bg-[#2c415e]/5 px-4 py-2.5 text-sm font-medium text-[#2c415e] hover:bg-[#2c415e]/10 transition-colors break-all"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {item.link_url}
                    </a>
                  </div>
                )}

                {item.pdf_url && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#666b6f] mb-2">
                      Document
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={item.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#2c415e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4a6789] transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Open PDF
                      </a>
                      <a
                        href={item.pdf_url}
                        download
                        className="inline-flex items-center gap-2 rounded-lg border border-[#2c415e] px-4 py-2.5 text-sm font-semibold text-[#2c415e] hover:bg-[#2c415e]/5 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                )}

                {!item.body_text && !item.link_url && !item.pdf_url && (
                  <p className="text-sm text-[#666b6f]">No additional content available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
