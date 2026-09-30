import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Teaching Hub",
  description: "Personal teaching workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}