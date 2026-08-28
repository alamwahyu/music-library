import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music Library",
  description: "Manage, group, and play a browser-based music library."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
