"use client";

import { LanguageProvider } from "@/lib/i18n/context";

export default function LanguageProviderWrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
