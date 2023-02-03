import Logger, { Class, Output } from "./logger.js";
import { PublicPrintOptions } from "./print.js";
import ToFileOnUnloadOutput from "./to-file-on-unload-output.js";
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
  { excludes, logger, saveOnUnload }: PublicPrintOptions = {}
) {
  const outputs: Output[] = [console];
  if (saveOnUnload) {
    outputs.push(new ToFileOnUnloadOutput());
  }
  logger = logger ?? new Logger(outputs, excludes);
  return new Proxy(object, callHandler({ logger }));
}

export function printInstanceCalls(
  klass: Class,
  options: PublicPrintOptions = {}
) {
  return new Proxy(klass, {
    construct(target, args) {
      return printCalls(new target(...args), options);
    },
  });
}
