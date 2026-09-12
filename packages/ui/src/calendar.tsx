"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { CALENDAR_TOKENS } from "@saasfly/common";

import { buttonVariants } from "./button";
import { cn } from "./utils/cn";

export type { DateRange } from "react-day-picker";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const ariaLabel = props["aria-label"] ?? CALENDAR_TOKENS.defaultAriaLabel;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      aria-label={ariaLabel}
      className={cn(CALENDAR_TOKENS.container, className)}
      classNames={{
        months: CALENDAR_TOKENS.months,
        month: CALENDAR_TOKENS.month,
        caption: CALENDAR_TOKENS.caption,
        caption_label: CALENDAR_TOKENS.caption_label,
        nav: CALENDAR_TOKENS.nav,
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          CALENDAR_TOKENS.nav_button.base,
          CALENDAR_TOKENS.nav_button.hoverScale,
          CALENDAR_TOKENS.nav_button.activeScale,
        ),
        nav_button_previous: CALENDAR_TOKENS.nav_button_previous,
        nav_button_next: CALENDAR_TOKENS.nav_button_next,
        table: CALENDAR_TOKENS.table,
        head_row: CALENDAR_TOKENS.head_row,
        head_cell: CALENDAR_TOKENS.head_cell,
        row: CALENDAR_TOKENS.row,
        cell: CALENDAR_TOKENS.cell,
        day: cn(
          buttonVariants({ variant: "ghost" }),
          CALENDAR_TOKENS.day.base,
          CALENDAR_TOKENS.day.hoverScale,
          CALENDAR_TOKENS.day.activeScale,
        ),
        day_selected: CALENDAR_TOKENS.day_selected,
        day_today: CALENDAR_TOKENS.day_today,
        day_outside: CALENDAR_TOKENS.day_outside,
        day_disabled: CALENDAR_TOKENS.day_disabled,
        day_range_middle: CALENDAR_TOKENS.day_range_middle,
        day_hidden: CALENDAR_TOKENS.day_hidden,
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => (
          <svg
            className={CALENDAR_TOKENS.chevron}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
