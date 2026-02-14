"use client";

import React from "react";
import Image from "next/image";

import {
  EXTERNAL_URLS,
  IMAGE_DIMENSIONS,
  WOBBLE_CARD_COLORS,
} from "@saasfly/common";
import { WobbleCard } from "@saasfly/ui/wobble-card";

export function WobbleCardShow() {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-3">
      <WobbleCard
        containerClassName={`col-span-1 lg:col-span-2 h-full ${WOBBLE_CARD_COLORS.pink.background} min-h-[${IMAGE_DIMENSIONS.wobbleCard.height}px] lg:min-h-[300px]`}
        className=""
      >
        <div className="max-w-xs">
          <h2 className="text-balance text-left text-base font-semibold tracking-[-0.015em] text-white md:text-xl lg:text-3xl">
            Stay up to date
          </h2>
          <p className="mt-4 text-left  text-base/6 text-neutral-200">
            We are committed to continually improving our starter kit and
            providing the best possible resources for building saas service.
          </p>
        </div>
        <Image
          src={EXTERNAL_URLS.aceternity.linearImage}
          width={IMAGE_DIMENSIONS.wobbleCard.width}
          height={IMAGE_DIMENSIONS.wobbleCard.height}
          alt="linear demo"
          className="absolute -bottom-10 -right-4 rounded-2xl object-contain grayscale filter lg:-right-[40%]"
        />
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px]">
        <h2 className="max-w-80  text-balance text-left text-base font-semibold tracking-[-0.015em] text-white md:text-xl lg:text-3xl">
          Philosophy
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          When creating this starter kit, we had several guiding principles in
          mind.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName={`col-span-1 lg:col-span-3 ${WOBBLE_CARD_COLORS.blue.background} min-h-[${IMAGE_DIMENSIONS.wobbleCard.height}px] lg:min-h-[600px] xl:min-h-[300px]`}>
        <div className="max-w-sm">
          <h2 className="max-w-sm text-balance  text-left text-base font-semibold tracking-[-0.015em] text-white md:max-w-lg md:text-xl lg:text-3xl">
            Streamline Your SaaS Development with Nextify&apos;s Starter Kit.
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
            Our starter kit embodies this expertise, empowering both our team
            and clients to build high-quality SaaS services faster and easier.
          </p>
        </div>
        <Image
          src={EXTERNAL_URLS.aceternity.linearImage}
          width={IMAGE_DIMENSIONS.wobbleCard.width}
          height={IMAGE_DIMENSIONS.wobbleCard.height}
          alt="linear demo"
          className="absolute -bottom-10 -right-10 rounded-2xl object-contain md:-right-[40%] lg:-right-[20%]"
        />
      </WobbleCard>
    </div>
  );
}
