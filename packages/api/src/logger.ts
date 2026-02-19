import pino from "pino";

import { IS_DEV, LOG_LEVEL } from "@saasfly/common";

const logger = pino({
  level: LOG_LEVEL,
  transport: IS_DEV
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

export { logger };
