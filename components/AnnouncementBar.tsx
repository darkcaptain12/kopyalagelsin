"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UIConfig } from "@/lib/config";

export default function AnnouncementBar() {
  const [uiConfig, setUiConfig] = useState<UIConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.ui) {
          setUiConfig(data.ui);
        }
      })
      .catch(() => {});
  }, []);

  if (!uiConfig?.announcementBar.enabled || !uiConfig.announcementBar.text) {
    return null;
  }

  const bar = uiConfig.announcementBar;
  const content = bar.link ? (
    <Link
      href={bar.link}
      className="block w-full text-center py-2 px-4 hover:opacity-90 transition"
      style={{
        backgroundColor: bar.backgroundColor,
        color: bar.textColor,
      }}
    >
      {bar.text}
    </Link>
  ) : (
    <div
      className="text-center py-2 px-4"
      style={{
        backgroundColor: bar.backgroundColor,
        color: bar.textColor,
      }}
    >
      {bar.text}
    </div>
  );

  return <div className="w-full">{content}</div>;
}

