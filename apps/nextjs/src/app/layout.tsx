import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";

import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { EXTERNAL_URLS, FEATURE_FLAGS } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Toaster } from "@saasfly/ui/toaster";

import { ConnectionStatus } from "~/components/connection-status";
import { KeyboardShortcutsHelp } from "~/components/keyboard-shortcuts-help";
import { PageProgressBar } from "~/components/page-progress";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ThemeProvider } from "~/components/theme-provider";
import { i18n } from "~/config/i18n-config";
import { siteConfig } from "~/config/site";

const FallbackProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const NextDevtoolsProvider =
  process.env.NODE_ENV === "development" &&
  process.env.ENABLE_DEVTOOLS === "true"
    ? (await import("@next-devtools/core")).NextDevtoolsProvider
    : FallbackProvider;

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

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Next.js",
    "Shadcn ui",
    "Sass",
    "Fast ",
    "Simple ",
    "Easy",
    "Cloud Native",
  ],
  authors: [
    {
      name: "saasfly",
    },
  ],
  creator: "Saasfly",
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
  metadataBase: new URL(EXTERNAL_URLS.demo.home),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidClerkKey =
    clerkKey &&
    !clerkKey.includes("dummy") &&
    !clerkKey.includes("placeholder") &&
    clerkKey.startsWith("pk_") &&
    clerkKey.length > 20;
  const ClerkProviderWrapper = isValidClerkKey
    ? ClerkProvider
    : FallbackProvider;

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
            defaultTheme="dark"
            enableSystem={false}
          >
            <PageProgressBar />
            <NextDevtoolsProvider>
              <main id="main-content">{children}</main>
            </NextDevtoolsProvider>
            {FEATURE_FLAGS.analytics.vercel && <Analytics />}
            {FEATURE_FLAGS.analytics.vercel && <SpeedInsights />}
            <Toaster />
            <KeyboardShortcutsHelp />
            <ConnectionStatus />
            <TailwindIndicator />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
