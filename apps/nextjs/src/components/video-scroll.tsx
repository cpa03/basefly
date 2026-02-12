"use client";

import Link from "next/link";
import Image from "next/image";

import { EXTERNAL_URLS } from "@saasfly/common";
import { ContainerScroll } from "@saasfly/ui/container-scroll-animation";
import { ColourfulText } from "@saasfly/ui/colorful-text";

export function VideoScroll({ dict } : { dict: Record<string, string> | undefined }) {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              {dict?.first_text}<br />
              <span className="text-4xl md:text-6xl font-bold mt-1 leading-none">
                {dict?.second_text1}<ColourfulText text={dict?.time_text ?? ''} />{dict?.second_text2}
              </span>
            </h1>
          </>
        }
      >
        <Link href={EXTERNAL_URLS.xBroadcast.demo} target="_blank">
          <Image
            src={EXTERNAL_URLS.cdn.ruguoapp}
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </Link>
      </ContainerScroll>
    </div>
  );
}
