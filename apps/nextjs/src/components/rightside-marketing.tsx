"use client";

import Link from "next/link";

import { EXTERNAL_URLS } from "@saasfly/common";
import { GlowingEffect } from "@saasfly/ui/glowing-effect";
import { Cloud, Rocket, ThumbsUp } from "@saasfly/ui/icons";

export function RightsideMarketing({
  dict,
}: {
  dict: Record<string, string> | undefined;
}) {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/7]"
        icon={<Rocket className="h-4 w-4 text-black dark:text-neutral-400" />}
        title={dict?.deploy_on_vercel_title ?? ""}
        description={dict?.deploy_on_vercel_desc ?? ""}
        link={EXTERNAL_URLS.vercel.deploy}
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/7]"
        icon={<Cloud className="h-4 w-4 text-black dark:text-neutral-400" />}
        title={dict?.ship_on_cloudflare_title ?? ""}
        description={dict?.ship_on_cloudflare_desc ?? ""}
        link={EXTERNAL_URLS.oneclick.home}
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/7/3/13]"
        icon={<ThumbsUp className="h-4 w-4 text-black dark:text-neutral-400" />}
        title={dict?.showcase_title ?? ""}
        description={dict?.showcase_desc ?? ""}
        link={EXTERNAL_URLS.discord.invite}
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  link?: string;
}

const GridItem = ({ area, icon, title, description, link }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="rounded-2.5xl relative h-full border p-2 dark:border-neutral-800 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <Link href={`${link ? link : ""}`} target="_blank">
          <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 dark:bg-neutral-900/40 dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
            <div className="relative flex flex-1 flex-col justify-between gap-3">
              <div className="w-fit rounded-lg border border-gray-600 p-2 dark:border-neutral-800">
                {icon}
              </div>
              <div className="space-y-3">
                <h3 className="-tracking-4 text-balance pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-black dark:text-white md:text-2xl/[1.875rem]">
                  {title}
                </h3>
                <h2 className="font-sans text-sm/[1.125rem] text-black dark:text-neutral-400 md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                  {description}
                </h2>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </li>
  );
};
