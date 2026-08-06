import Link from "next/link";

const footerNav = {
  Company: [
    { label: "About", href: "/about" },
    { label: "Advertise", href: "/advertise" },
    { label: "Contact", href: "/contact" },
    { label: "Newsletter", href: "/newsletter" },
  ],
  Sections: [
    { label: "Commercial", href: "/category/commercial" },
    { label: "Residential", href: "/category/residential" },
    { label: "Infrastructure", href: "/category/infrastructure" },
    { label: "Safety & Regulation", href: "/category/safety-regulation" },
    { label: "Materials & Equipment", href: "/category/materials-equipment" },
    { label: "Technology", href: "/category/technology" },
  ],
  Account: [
    { label: "Sign in", href: "/sign-in" },
    { label: "Create account", href: "/sign-up" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-line bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight">
              BuildWire
            </p>
            <p className="mt-2 text-sm text-white/60">
              Construction industry news, analysis and insight for professionals
              who build.
            </p>
          </div>
          {Object.entries(footerNav).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {heading}
              </p>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} BuildWire. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Built for the people who build everything else.
          </p>
        </div>
      </div>
    </footer>
  );
}
