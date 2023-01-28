import Logger, { Class } from "./logger.js";
import { PublicPrintOptions } from "./print.js";
import Trace from "./trace.js";

function callHandler({ logger }: { logger: Logger }) {
  return {
    get(target: any, propKey: string, receiver: any) {
      const targetValue = Reflect.get(target, propKey, receiver);
      if (
        !Trace.isPaused &&
        propKey !== "constructor" &&
        typeof targetValue === "function"
      ) {
        return function (this: any, ...args: any[]) {
          let error: any;
          let result: any;
          try {
            result = targetValue.apply(this, args);
            return result;
          } catch (err) {
            error = err;
            throw err;
          } finally {
            Trace.pause(() =>
              logger.call({
                propKey,
                args,
                klass: target.constructor as Class,
                ...(!!error && { error }),
                ...(!error && { result }),
              })
            );
          }
        };
      } else {
        return targetValue;
      }
    },
  };
}

export function printCalls(
  object: object,
  { logger }: PublicPrintOptions = {}
) {
  logger = logger ?? new Logger([console]);
  return new Proxy(object, callHandler({ logger }));
}

export function printInstanceCalls(
  klass: Class,
  { logger }: PublicPrintOptions = {}
) {
  logger = logger ?? new Logger([console]);
  return new Proxy(klass, {
    construct(target, args) {
      return printCalls(new target(...args), { logger });
    },
  });
}
