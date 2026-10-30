import React from "react";
import { QUESTIONS_TOKENS } from "@saasfly/common";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@saasfly/ui/accordion";

interface QuestionsProps {
  className?: string;
  items?: readonly {
    id: string;
    question: string;
    answer: string;
  }[];
  "aria-label"?: string;
}

export const Questions = React.memo(function Questions({
  className = "",
  items = QUESTIONS_TOKENS.items,
  "aria-label": ariaLabel = QUESTIONS_TOKENS.defaultAriaLabel,
}: QuestionsProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={`${QUESTIONS_TOKENS.container} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
});

Questions.displayName = "Questions";
