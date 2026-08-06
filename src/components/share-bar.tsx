"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SaveButton } from "./save-button";
import { cn } from "@/lib/utils";

const NETWORKS = [
  { name: "X", label: "Share on X", href: (u: string, t: string) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  {
    name: "LinkedIn",
    label: "Share on LinkedIn",
    href: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    name: "Facebook",
    label: "Share on Facebook",
    href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    name: "Copy",
    label: "Copy link",
    href: () => "#",
  },
];

export function ShareBar({
  articleId,
  title,
  saved,
  signedIn,
}: {
  articleId: string;
  title: string;
  saved: boolean;
  signedIn: boolean;
}) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${pathname}`;

  return (
    <div className="sticky top-16 z-40 border-b border-line bg-paper/90 py-2.5 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-1">
          {NETWORKS.map((n) => (
            <a
              key={n.name}
              href={n.name === "Copy" ? undefined : n.href(url, title)}
              target={n.name === "Copy" ? undefined : "_blank"}
              rel="noreferrer"
              onClick={
                n.name === "Copy"
                  ? (e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(url).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      });
                    }
                  : undefined
              }
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-line/60 hover:text-ink"
              title={n.label}
            >
              {n.name === "Copy" ? (
                copied ? (
                  <span className="text-accent-strong">Copied!</span>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )
              ) : (
                <span className={cn("text-sm", n.name === "X" && "font-semibold")}>{n.name}</span>
              )}
            </a>
          ))}
        </div>
        <SaveButton articleId={articleId} initialSaved={saved} isSignedIn={signedIn} variant="quiet" />
      </div>
    </div>
  );
}
