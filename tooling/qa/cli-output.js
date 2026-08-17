#!/usr/bin/env node
/**
 * Shared CLI output utilities for Basefly tooling scripts.
 *
 * Provides consistent, color-coded console formatting across all
 * standalone Node.js scripts (env-validate, validate-ci-workflows,
 * release-tag, ...). Previously each script duplicated its own inline
 * ANSI color map and log helpers; this module centralizes them so all
 * CLI output follows the same conventions.
 *
 * Usage:
 *   const { log, logInfo, logSuccess, logWarning, logError } = require("./cli-output");
 *
 * Behavior:
 *   - Color output is enabled only when stdout/stderr is a TTY and the
 *     NO_COLOR / CI environment variables are not set.
 *   - Log level is controlled by the CLI_LOG_LEVEL environment variable
 *     (silent | error | warn | info | debug), defaulting to "info".
 *     Levels below the threshold are suppressed.
 */

"use strict";

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Log levels, ordered from most to least severe.
const LOG_LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

function resolveLevel() {
  const raw = (process.env.CLI_LOG_LEVEL || "info").toLowerCase();
  return Object.prototype.hasOwnProperty.call(LOG_LEVELS, raw)
    ? LOG_LEVELS[raw]
    : LOG_LEVELS.info;
}

// Only emit ANSI colors when output is a TTY and color is not disabled.
function colorEnabled(stream) {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.CI === "true") return false;
  return Boolean(stream && stream.isTTY);
}

const stdoutColor = colorEnabled(process.stdout);
const stderrColor = colorEnabled(process.stderr);
const currentLevel = resolveLevel();

/**
 * Wrap a message in an ANSI color code.
 * @param {string} msg - The message to colorize
 * @param {string} color - Key into the `colors` map
 * @param {boolean} enabled - Whether to emit ANSI codes (defaults to stdout TTY)
 * @returns {string} The colorized message
 */
function colorize(msg, color, enabled = stdoutColor) {
  if (!enabled || !color || !colors[color]) return msg;
  return `${colors[color]}${msg}${colors.reset}`;
}

/** Bold segment helper for embedding within a larger message. */
function bold(msg) {
  return colorize(msg, "bold");
}

/** Cyan segment helper for embedding within a larger message. */
function cyan(msg) {
  return colorize(msg, "cyan");
}

/**
 * Generic log helper.
 * @param {string} msg - The message to print
 * @param {string} color - Key into the `colors` map (default: no color)
 * @param {number} level - Minimum log level required to emit
 */
function log(msg = "", color = "reset", level = LOG_LEVELS.info) {
  if (currentLevel < level) return;
  console.log(colorize(msg, color, stdoutColor));
}

/** Print a raw message (no color, no prefix). */
function logPlain(msg = "") {
  if (currentLevel < LOG_LEVELS.info) return;
  console.log(msg);
}

/** Info-level message, blue with an info icon. */
function logInfo(msg) {
  if (currentLevel < LOG_LEVELS.info) return;
  console.log(colorize(`ℹ️  ${msg}`, "blue", stdoutColor));
}

/** Success message, green with a checkmark icon. */
function logSuccess(msg) {
  if (currentLevel < LOG_LEVELS.info) return;
  console.log(colorize(`✅ ${msg}`, "green", stdoutColor));
}

/** Warning message, yellow with a warning icon, printed to stderr. */
function logWarning(msg) {
  if (currentLevel < LOG_LEVELS.warn) return;
  console.warn(colorize(`⚠️  ${msg}`, "yellow", stderrColor));
}

/** Error message, red with a cross icon, printed to stderr. */
function logError(msg) {
  if (currentLevel < LOG_LEVELS.error) return;
  console.error(colorize(`❌ ${msg}`, "red", stderrColor));
}

/** Debug message, cyan, only emitted at debug level. */
function logDebug(msg) {
  if (currentLevel < LOG_LEVELS.debug) return;
  console.log(colorize(msg, "cyan", stdoutColor));
}

module.exports = {
  colors,
  colorize,
  bold,
  cyan,
  log,
  logPlain,
  logInfo,
  logSuccess,
  logWarning,
  logError,
  logDebug,
  LOG_LEVELS,
};
