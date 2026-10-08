import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lớp Hóa Thầy Dương — Rebuild",
  description: "TDH Study Rebuild"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
