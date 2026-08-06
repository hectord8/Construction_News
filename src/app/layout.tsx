import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getCategories } from "@/lib/queries";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "BuildWire — Construction News & Analysis",
    template: "%s | BuildWire",
  },
  description:
    "Daily construction industry news: project announcements, materials and equipment, regulation and safety, and the technology shaping how we build.",
  openGraph: {
    type: "website",
    siteName: "BuildWire",
  },
};

// The root layout queries the DB for the category nav, and Railway's build
// environment cannot reach the private Postgres hostname. Rendering routes
// dynamically avoids prerendering during `next build`.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
        <body className="flex min-h-screen flex-col">
          <Header
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
            }))}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
