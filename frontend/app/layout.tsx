import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { WebSocketProvider } from "@/providers/websocket-provider";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: '--font-inter' });

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
      className={cn("h-full", "antialiased", "dark", inter.className)}
    >
      <body className="min-h-full flex flex-col">
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}
