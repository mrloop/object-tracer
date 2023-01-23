import safeJsonValue from "safe-json-value";

import Logger from "./logger.js";

export type PublicPrintOptions = {
  logger?: Logger;
};

export let shouldLog = true;

/* Don't log function calls made when logging */
export function pauseLog(fnc: () => any) {
  const original = shouldLog;
  try {
    shouldLog = false;
    return fnc();
  } finally {
    shouldLog = original;
  }
}

export function copy(obj: object): object {
  return pauseLog(() => safeJsonValue(obj).value || {});
}
