import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ZeroGate",
  description: "Portal de autenticación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", "dark")}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
