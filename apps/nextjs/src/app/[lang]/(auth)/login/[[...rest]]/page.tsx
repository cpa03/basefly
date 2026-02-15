import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import { ChevronLeft } from "@saasfly/ui/icons";

import { UserClerkAuthForm } from "~/components/user-clerk-auth-form";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

function isClerkEnabled(): boolean {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!(
    clerkKey &&
    !clerkKey.includes("dummy") &&
    !clerkKey.includes("placeholder") &&
    clerkKey.startsWith("pk_") &&
    clerkKey.length > 20
  );
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{
    lang: Locale;
  }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const clerkEnabled = isClerkEnabled();

  return (
    <main className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <Link
        href={`/${lang}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
        aria-label="Go to home page"
      >
        <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        {dict.login.back}
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <Image
            src="/images/avatars/saasfly-logo.svg"
            className="mx-auto"
            width="64"
            height="64"
            alt="Saasfly Logo"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            {dict.login.welcome_back}
          </h1>
        </div>
        {clerkEnabled ? (
          <UserClerkAuthForm lang={lang} dict={dict.login} />
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Authentication is not configured.</p>
            <p className="text-sm">Please contact the administrator.</p>
          </div>
        )}
      </div>
    </main>
  );
}
