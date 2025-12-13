import Navbar from "@/components/Navbar";
import { Footer2 } from "@/components/ui/shadcnblocks-com-footer2";
import type { Metadata } from "next";
import { Martian_Mono } from "next/font/google";
import "./globals.css";

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RolyAI | Speak your way to fluency",
  description:
    "Practice real-life conversations with AI, get instant feedback, and build fluency faster with RolyAI.",
  keywords: [
    "RolyAI",
    "language learning",
    "AI tutor",
    "speaking practice",
    "conversation practice",
    "English learning",
    "pronunciation feedback",
  ],
  authors: [{ name: "RolyAI" }],
  creator: "RolyAI",
  applicationName: "RolyAI",
  metadataBase:
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
  openGraph: {
    title: "RolyAI | Speak your way to fluency",
    description:
      "Practice real-life conversations with AI, get instant feedback, and build fluency faster with RolyAI.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "RolyAI",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "RolyAI mobile app preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RolyAI | Speak your way to fluency",
    description:
      "Practice real-life conversations with AI, get instant feedback, and build fluency faster with RolyAI.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${martianMono.variable} font-mono antialiased`}>
        <Navbar />
        {children}
        <Footer2 />
      </body>
    </html>
  );
}
