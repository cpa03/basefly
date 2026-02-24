import pino from "pino";

import { IS_DEV, LOG_LEVEL } from "@saasfly/common";

type LoggerMetadata = Record<string, unknown>;

const isTest = process.env.NODE_ENV === "test";

const pinoLogger = pino({
  level: isTest ? "silent" : LOG_LEVEL,
  transport:
    IS_DEV && !isTest
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export const logger = {
  info(message: string, data?: LoggerMetadata): void {
    pinoLogger.info(data ?? {}, message);
  },

  warn(message: string, data?: LoggerMetadata): void {
    pinoLogger.warn(data ?? {}, message);
  },

  error(message: string, error?: unknown, data?: LoggerMetadata): void {
    pinoLogger.error({ error, ...data }, message);
  },
};
