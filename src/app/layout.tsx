import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWH Digital Music Library",
  description: "Manage, group, and play music collections with AWH Digital Music Library."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
