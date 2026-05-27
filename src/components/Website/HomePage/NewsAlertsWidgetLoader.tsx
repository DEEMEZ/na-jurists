"use client";

import dynamic from "next/dynamic";

const NewsAlertsWidget = dynamic(
  () => import("./NewsAlertsWidget").then((m) => ({ default: m.NewsAlertsWidget })),
  { ssr: false },
);

export function NewsAlertsWidgetLoader() {
  return <NewsAlertsWidget />;
}
