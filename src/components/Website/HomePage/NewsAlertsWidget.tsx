"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Newspaper, ArrowRight } from "lucide-react";

type NewsAlertItem = {
  id: string;
  headline: string;
  organization: string;
  published_at: string;
};

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  } catch {
    return "";
  }
}

export function NewsAlertsWidget() {
  const [items, setItems] = useState<NewsAlertItem[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/news-alerts", { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((payload: { data: NewsAlertItem[] }) => {
        const rows = payload.data?.slice(0, 3) ?? [];
        if (rows.length > 0) {
          setItems(rows);
          setVisible(true);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-[#2c415e] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <Newspaper className="h-4 w-4 text-white/80" />
          <span className="text-sm font-semibold text-white">Liquidation News &amp; Alerts</span>
        </div>
        <button
          type="button"
          onClick={() => setMinimized((m) => !m)}
          className="text-white/70 hover:text-white transition-colors"
          aria-label={minimized ? "Expand" : "Minimize"}
        >
          {minimized ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="bg-white">
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/liquidation/${encodeURIComponent(item.organization)}/${item.id}`}
                  className="group flex flex-col gap-0.5 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-medium text-[#2c415e] line-clamp-2 group-hover:text-[#4a6789] transition-colors leading-snug">
                    {item.headline}
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-gray-400 truncate max-w-[160px]">
                      {item.organization}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {timeAgo(item.published_at)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-100 px-4 py-2.5">
            <Link
              href="/liquidation"
              className="flex items-center justify-between text-xs font-semibold text-[#2c415e] hover:text-[#4a6789] transition-colors"
            >
              View all news
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
