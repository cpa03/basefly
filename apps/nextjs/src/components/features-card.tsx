"use client";

import { ANIMATION, NOTIFICATION_COLORS, SHADOW_COLORS } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { AnimatedList } from "@saasfly/ui/animated-list";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "Payment received",
    description: "Stripe subscription",
    time: "15m ago",

    icon: "💸",
    color: NOTIFICATION_COLORS.payment,
  },
  {
    name: "User signed up",
    description: "Auth, simple and clean",
    time: "10m ago",
    icon: "👤",
    color: NOTIFICATION_COLORS.signup,
  },
  {
    name: "New Emails",
    description: "Create beautiful emails",
    time: "5m ago",
    icon: "💬",
    color: NOTIFICATION_COLORS.message,
  },
  {
    name: "Easy Deploy",
    description: "Deploy your app with ease",
    time: "2m ago",
    icon: "🗞️",
    color: NOTIFICATION_COLORS.deployment,
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] transform cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        `transition-all ${ANIMATION.duration.normal} ${ANIMATION.easing.smooth} ${ANIMATION.scale.subtle}`,
        // light styles
        `bg-white [box-shadow:0_0_0_1px_${SHADOW_COLORS.light.DEFAULT},0_2px_4px_${SHADOW_COLORS.light.dark},0_12px_24px_${SHADOW_COLORS.light.dark}]`,
        // dark styles
        `transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_${SHADOW_COLORS.darkMode.border}] dark:[box-shadow:0_-20px_80px_-20px_${SHADOW_COLORS.darkMode.inset}_inset]`,
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function FeaturesCard() {
  return (
    <div className={`relative flex max-h-[435px] min-h-[435px] flex-col overflow-hidden rounded-2xl border bg-background p-6 shadow-lg dark:border-[${SHADOW_COLORS.darkMode.border}]`}>
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  );
}
