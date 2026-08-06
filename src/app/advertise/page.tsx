import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advertise",
  description:
    "Reach construction professionals with BuildWire sponsorship and advertising.",
};

const tiers = [
  {
    name: "Section sponsor",
    price: "Monthly",
    description:
      "Sponsor one of our six topic sections. Your brand sits at the top of every story in that section.",
    features: [
      "Logo + 50-word message on section pages",
      "Dedicated story placement each month",
      "Monthly performance report",
    ],
  },
  {
    name: "Featured newsletter",
    price: "Per send",
    description:
      "Reach our newsletter subscribers with a sponsored item in the weekly digest.",
    features: [
      "Sponsored slot in the weekly digest",
      "Subject-line mention option",
      "Click and open reporting",
    ],
  },
  {
    name: "Custom partnership",
    price: "By arrangement",
    description:
      "Co-branded content, sponsored research or a guest column authored with our editors.",
    features: [
      "Editorial review and quality control",
      "Byline and backlinks to your company",
      "Content syndication rights",
    ],
  },
];

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
          Advertise
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Reach the people who build.
        </h1>
        <p className="mt-4 text-muted">
          Equipment manufacturers, materials suppliers, software companies and
          service providers can reach a focused audience of construction
          professionals through BuildWire&apos;s sections and newsletter.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="flex flex-col rounded-xl border border-line bg-paper p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
              {tier.price}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              {tier.name}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              {tier.description}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="mt-0.5 shrink-0 text-accent"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-charcoal p-8 text-white">
        <h2 className="font-display text-2xl font-extrabold">
          Let&apos;s talk about your audience
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
          Tell us who you&apos;re trying to reach and we&apos;ll put together a
          proposal with verified section and newsletter numbers.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Contact the team
        </Link>
      </div>
    </div>
  );
}
