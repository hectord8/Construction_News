import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "BuildWire covers the construction industry: projects, materials, regulation and the technology changing how we build.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
          About BuildWire
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          The trade publication for the people who build everything else.
        </h1>
      </header>

      <div className="prose-article space-y-6 text-ink">
        <p>
          BuildWire is a construction industry news and analysis publication.
          We cover the projects, the markets and the rules that shape how
          buildings, roads and cities get made — written for the contractors,
          engineers, owners and tradespeople who do the work.
        </p>
        <h2>What we cover</h2>
        <p>
          Our sections follow the shape of the industry itself: commercial and
          residential construction, infrastructure and public works, safety and
          regulation, materials and equipment, and the technology that is
          quietly changing every phase of a project.
        </p>
        <h2>Our approach</h2>
        <p>
          We report on public records, regulatory action, project
          announcements and company filings, and we explain what it means for
          the people pricing, permitting and pouring the work. When we
          summarize industry coverage elsewhere, we add our own analysis and
          link to the original source.
        </p>
        <h2>Free accounts</h2>
        <p>
          Reading is free. Registered users get a personal dashboard where they
          can save articles, follow the topics that matter to them and opt into
          a weekly digest. No paywalls, no noise.
        </p>
        <p>
          Want to tip a story, sponsor a section or partner on content?{" "}
          <Link href="/contact" className="text-accent-strong underline">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
