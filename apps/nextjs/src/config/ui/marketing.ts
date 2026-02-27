import { EXTERNAL_URLS, ROUTES } from "@saasfly/common";

import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import type { MarketingConfig } from "~/types";

export const getMarketingConfig = async ({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}): Promise<MarketingConfig> => {
  const dict = await getDictionary(lang);
  return {
    mainNav: [
      {
        title: "Libra AI",
        href: EXTERNAL_URLS.libra.home,
      },
      {
        title: dict.marketing.main_nav_features,
        href: ROUTES.marketing.features,
      },
      {
        title: dict.marketing.main_nav_pricing,
        href: ROUTES.marketing.pricing,
      },
      {
        title: dict.marketing.main_nav_blog,
        href: ROUTES.marketing.blog,
      },
      {
        title: dict.marketing.main_nav_documentation,
        href: ROUTES.marketing.docs,
      },
    ],
  };
};
