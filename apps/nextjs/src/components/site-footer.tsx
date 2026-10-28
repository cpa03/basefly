import * as React from "react";
import Image from "next/image";

import { ASSETS, SITE_FOOTER_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";

import { ModeToggle } from "~/components/mode-toggle";

function getCopyrightText(
  dict: Record<string, string | Record<string, string>>,
): string | undefined {
  const currentYear = new Date().getFullYear();
  const copyrightTemplate =
    typeof dict?.copyright === "string" ? dict.copyright : "";
  return copyrightTemplate?.replace("${currentYear}", String(currentYear));
}

export function SiteFooter({
  className,
  dict,
  role = SITE_FOOTER_TOKENS.footer.defaultRole,
  "aria-label": ariaLabel = SITE_FOOTER_TOKENS.footer.defaultAriaLabel,
}: {
  className?: string;
  params?: {
    lang: string;
  };
  dict?: Record<string, string | Record<string, string>>;
  role?: string;
  "aria-label"?: string;
}): React.JSX.Element {
  return (
    <footer
      className={cn(SITE_FOOTER_TOKENS.footer.base, className)}
      role={role}
      aria-label={ariaLabel}
    >
      <div className={SITE_FOOTER_TOKENS.container}>
        <div className={SITE_FOOTER_TOKENS.branding.wrapper}>
          <Image
            src={ASSETS.logo}
            width={Number(SITE_FOOTER_TOKENS.branding.logoSize)}
            height={Number(SITE_FOOTER_TOKENS.branding.logoSize)}
            sizes={`${SITE_FOOTER_TOKENS.branding.logoSize}px`}
            alt="Basefly logo"
          />
          <p className={SITE_FOOTER_TOKENS.branding.copyrightText}>
            {getCopyrightText(dict ?? {})}
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  );
}
