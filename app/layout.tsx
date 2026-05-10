import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Colour Wall — leave your colour on the internet",
  description:
    "A public canvas made one tiny square at a time. Pick a colour, add a message or link, or build something bigger across multiple squares. $1 a square.",
  openGraph: {
    title: "The Colour Wall — leave your colour on the internet",
    description:
      "Claim a tiny square on a public canvas. Pick a colour, leave your mark.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Colour Wall",
    description:
      "Claim a square. Pick a colour. Leave your mark on a public canvas.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="font-sans text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
