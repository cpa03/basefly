import pino from "pino";

import { IS_DEV, LOG_LEVEL } from "@saasfly/common";

interface LoggerMetadata {
  requestId?: string;
  [key: string]: unknown;
}

const pinoLogger = pino({
  level: LOG_LEVEL,
  transport: IS_DEV
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

const logger = {
  debug(message: string, data?: LoggerMetadata) {
    pinoLogger.debug(data ?? {}, message);
  },

  info(message: string, data?: LoggerMetadata) {
    pinoLogger.info(data ?? {}, message);
  },

  warn(message: string, data?: LoggerMetadata) {
    pinoLogger.warn(data ?? {}, message);
  },

  error(message: string, error?: unknown, data?: LoggerMetadata) {
    pinoLogger.error({ error, ...data }, message);
  },
};

export { logger };
