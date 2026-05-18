import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPA — Scheduled Personal Assistant",
  description: "Asisten jadwal harian pribadi minimalis berbasis AI dengan privasi tinggi (Privacy-First).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#f4f4f5]`}
    >
      <body className="min-h-full flex flex-col bg-[#f4f4f5] overflow-x-hidden text-zinc-900">{children}</body>
    </html>
  );
}
