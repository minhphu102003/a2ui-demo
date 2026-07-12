import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A2UI Demo - Course Catalog",
  description: "Demo project for A2UI (Agent-to-User Interface)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
