import { METEORS_CARD_COLORS } from "@saasfly/common";
import { Meteors } from "@saasfly/ui/meteors";

import type { Meteor } from "~/types/meteors";

export function Meteorss({ meteor }: { meteor: Meteor }) {
  return (
    <div className="w-full">
      <div className="relative w-full">
        <div className={`absolute inset-0 h-full w-full scale-[0.80] transform rounded-full ${METEORS_CARD_COLORS.default.blur} bg-gradient-to-r ${METEORS_CARD_COLORS.default.gradientFrom} ${METEORS_CARD_COLORS.default.gradientTo} blur-3xl`} />
        <div className={`relative flex h-full flex-col items-start justify-end overflow-hidden rounded-2xl border ${METEORS_CARD_COLORS.default.border} px-4 py-8 shadow-xl dark:bg-gray-900 dark:bg-opacity-70`}>
          <h1 className="relative z-50 mb-4 text-2xl font-bold">
            {meteor.name}
          </h1>

          <p className={`light:text-slate-600 relative z-50 mb-4 text-base font-normal ${METEORS_CARD_COLORS.default.text}`}>
            {meteor.description}
          </p>
          <a href={meteor.url} target="_blank" rel="noopener noreferrer">
            <button className={`light:text-gray-400 rounded-lg border ${METEORS_CARD_COLORS.default.button.border} px-4 py-1 ${METEORS_CARD_COLORS.default.button.text}`}>
              {meteor.button_content}
            </button>

            {/* Meaty part - Meteor effect */}
            <Meteors number={20} />
          </a>
        </div>
      </div>
    </div>
  );
}
