import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import LanguageProviderWrapper from "@/components/LanguageProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoElite Motors - Find Your Dream Car Today",
  description: "Premium car dealership offering quality new and used vehicles with transparent pricing. Browse our curated inventory, get financing, and trade-in your car.",
  keywords: ["car dealership", "vehicles", "auto sales", "used cars", "new cars", "financing", "trade-in"],
  authors: [{ name: "AutoElite Motors" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProviderWrapper>
          {children}
        </LanguageProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
