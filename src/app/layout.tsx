import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "# Safe Chat",
  description: "Realtime | Safe | self destructing chat room",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
