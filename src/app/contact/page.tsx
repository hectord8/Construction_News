import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the BuildWire editorial team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
          Contact
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Talk to the team
        </h1>
        <p className="mt-3 text-muted">
          Have a tip, a correction, a story idea or an advertising question?
          Drop us a line — we read everything.
        </p>
      </header>
      <ContactForm />
    </div>
  );
}
