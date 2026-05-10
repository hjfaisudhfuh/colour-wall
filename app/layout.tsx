import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dollar Grid",
  description:
    "10,000 squares. $1 each. Pick a color, leave a name and a link, claim a pixel of the internet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
