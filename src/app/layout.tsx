import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dependabot Todo Lab",
  description:
    "A tiny todo app with tests, CI, and intentionally pinned older dependencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
