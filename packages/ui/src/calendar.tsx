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
  "aria-label": ariaLabel = CALENDAR_TOKENS.defaultAriaLabel,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      aria-label={ariaLabel}
      className={cn(CALENDAR_TOKENS.base, className)}
      classNames={{
        months: CALENDAR_TOKENS.classNames.months,
        month: CALENDAR_TOKENS.classNames.month,
        caption: CALENDAR_TOKENS.classNames.caption,
        caption_label: CALENDAR_TOKENS.classNames.caption_label,
        nav: CALENDAR_TOKENS.classNames.nav,
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          CALENDAR_TOKENS.classNames.nav_button,
        ),
        nav_button_previous: CALENDAR_TOKENS.classNames.nav_button_previous,
        nav_button_next: CALENDAR_TOKENS.classNames.nav_button_next,
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          CALENDAR_TOKENS.classNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          CALENDAR_TOKENS.classNames.button_next,
        ),
        table: CALENDAR_TOKENS.classNames.table,
        head_row: CALENDAR_TOKENS.classNames.head_row,
        head_cell: CALENDAR_TOKENS.classNames.head_cell,
        row: CALENDAR_TOKENS.classNames.row,
        cell: CALENDAR_TOKENS.classNames.cell,
        day: cn(
          buttonVariants({ variant: "ghost" }),
          CALENDAR_TOKENS.classNames.day,
        ),
        day_selected: CALENDAR_TOKENS.classNames.day_selected,
        day_today: CALENDAR_TOKENS.classNames.day_today,
        day_outside: CALENDAR_TOKENS.classNames.day_outside,
        day_disabled: CALENDAR_TOKENS.classNames.day_disabled,
        day_range_middle: CALENDAR_TOKENS.classNames.day_range_middle,
        day_hidden: CALENDAR_TOKENS.classNames.day_hidden,
        ...classNames,
      }}
      components={{
        Chevron: ({ className, ...props }) => (
          <svg
            className={cn(CALENDAR_TOKENS.chevron.size, className)}
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
