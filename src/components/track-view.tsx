"use client";

import { useEffect, useRef } from "react";

export function TrackView({ articleId }: { articleId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    }).catch(() => {});
  }, [articleId]);
  return null;
}
