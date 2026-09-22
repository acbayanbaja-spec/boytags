import { env } from "../config/env.js";

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = levels[env.LOG_LEVEL] ?? 2;

function write(level, message, extra) {
  if ((levels[level] ?? 2) > current) return;
  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...(extra ? { extra } : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else console.log(line);
}

export const logger = {
  error: (message, extra) => write("error", message, extra),
  warn: (message, extra) => write("warn", message, extra),
  info: (message, extra) => write("info", message, extra),
  debug: (message, extra) => write("debug", message, extra),
};
