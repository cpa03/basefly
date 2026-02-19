import { LOG_LEVEL, LogLevel } from "@saasfly/common";

interface LoggerMetadata {
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = Object.values(LogLevel).includes(LOG_LEVEL as LogLevel)
      ? (LOG_LEVEL as LogLevel)
      : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(message: string, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(JSON.stringify({ level: "debug", message, ...data }));
    }
  }

  info(message: string, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(JSON.stringify({ level: "info", message, ...data }));
    }
  }

  warn(message: string, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(JSON.stringify({ level: "warn", message, ...data }));
    }
  }

  error(message: string, error?: unknown, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        JSON.stringify({ level: "error", message, error, ...data }),
      );
    }
  }
}

export const logger = new Logger();
