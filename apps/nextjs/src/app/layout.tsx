import { ClerkProvider } from "@clerk/nextjs";
import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";

import "~/styles/globals.css";

import { NextDevtoolsProvider } from "@next-devtools/core";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn } from "@saasfly/ui";
import { Toaster } from "@saasfly/ui/toaster";

import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ThemeProvider } from "~/components/theme-provider";
import { i18n } from "~/config/i18n-config";
import { siteConfig } from "~/config/site";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: "../styles/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

/**
 * Parse keywords from environment variable or use defaults
 */
function getMetadataKeywords(): string[] {
  const envKeywords = process.env.NEXT_PUBLIC_METADATA_KEYWORDS;
  if (envKeywords) {
    return envKeywords.split(",").map(k => k.trim()).filter(Boolean);
  }
  return [
    "Next.js",
    "Shadcn ui",
    "SaaS",
    "Fast",
    "Simple",
    "Easy",
    "Cloud Native",
    "Kubernetes",
    "K8s",
  ];
}

/**
 * Get metadata base URL from environment or use default
 */
function getMetadataBase(): URL {
  const envBase = process.env.NEXT_PUBLIC_METADATA_BASE_URL;
  if (envBase) {
    return new URL(envBase);
  }
  return new URL(siteConfig.url);
}

/**
 * Get default theme from environment or use fallback
 */
function getDefaultTheme(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_THEME ?? "dark";
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: getMetadataKeywords(),
  authors: [
    {
      name: siteConfig.name.toLowerCase(),
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: getMetadataBase(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidClerkKey = clerkKey && clerkKey !== "1";
  const ClerkProviderWrapper = isValidClerkKey
    ? ClerkProvider
    : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <ClerkProviderWrapper publishableKey={isValidClerkKey ? clerkKey : ""}>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontHeading.variable,
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme={getDefaultTheme()}
            enableSystem={false}
          >
            <NextDevtoolsProvider>{children}</NextDevtoolsProvider>
            <Analytics />
            <SpeedInsights />
            <Toaster />
            <TailwindIndicator />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
