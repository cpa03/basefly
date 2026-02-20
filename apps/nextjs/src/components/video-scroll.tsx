"use client";

import Image from "next/image";
import Link from "next/link";

import { EXTERNAL_URLS } from "@saasfly/common";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import { ContainerScroll } from "@saasfly/ui/container-scroll-animation";

export function VideoScroll({
  dict,
}: {
  dict: Record<string, string> | undefined;
}) {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              {dict?.first_text}
              <br />
              <span className="mt-1 text-4xl font-bold leading-none md:text-6xl">
                {dict?.second_text1}
                <ColourfulText text={dict?.time_text ?? ""} />
                {dict?.second_text2}
              </span>
            </h1>
          </>
        }
      >
        <Link href={EXTERNAL_URLS.xBroadcast.demo} target="_blank">
          <Image
            src={EXTERNAL_URLS.cdn.ruguoapp}
            alt="Basefly dashboard preview showing Kubernetes cluster management interface"
            height={720}
            width={1400}
            className="mx-auto h-full rounded-2xl object-cover object-left-top"
            draggable={false}
          />
        </Link>
      </ContainerScroll>
    </div>
  );
}
