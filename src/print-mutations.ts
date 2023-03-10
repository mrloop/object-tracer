import { getDiff } from "json-difference";

import isConstructor from "./is-constructor.js";
import Logger, { Class, Output } from "./logger.js";
import { PublicPrintOptions } from "./print.js";
import ToFileOnUnloadOutput from "./to-file-on-unload-output.js";
import Trace from "./trace.js";

type State = {
  shouldLogSet: boolean;
};

function setHandler({ logger, state }: { logger: Logger; state?: State }) {
  return {
    set(target: any, propKey: string, value: any, receiver: any) {
      if (state?.shouldLogSet) {
        const originalState = Trace.copy(receiver);
        const result = Reflect.set(target, propKey, value, receiver);
        const newState = Trace.copy(receiver);
        logger.mutation({
          propKey,
          args: value,
          klass: target.constructor,
          diff: getDiff(originalState, newState),
        });
        return result;
      } else {
        return Reflect.set(target, propKey, value, receiver);
      }
    },
  };
}

export function printSets(object: object, { logger }: PublicPrintOptions = {}) {
  logger = logger ?? new Logger([console]);
  return new Proxy(object, setHandler({ logger }));
}

function functionHandler({ logger, state }: { logger: Logger; state: State }) {
  return {
    get(target: any, propKey: string, receiver: any) {
      const targetValue = Reflect.get(target, propKey, receiver);
      if (
        !Trace.isPaused &&
        propKey !== "constructor" &&
        typeof targetValue === "function" &&
        !isConstructor(targetValue)
      ) {
        return function (this: any, ...args: any[]) {
          const originalState = Trace.copy(receiver);
          let error: any;
          try {
            return pauseLogSet(() => targetValue.apply(this, args), state);
          } catch (err) {
            error = err;
            throw err;
          } finally {
            const newState = Trace.copy(receiver);
            Trace.pause(() =>
              logger.mutation({
                propKey,
                args,
                ...(!!error && { error }),
                klass: target.constructor,
                diff: getDiff(originalState, newState),
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

/* Don't log a `set` triggered by a `get` */
function pauseLogSet(fnc: () => any, state: State) {
  const original = state.shouldLogSet;
  try {
    state.shouldLogSet = false;
    return fnc();
  } finally {
    state.shouldLogSet = original;
  }
}

export function printMutations(
  object: object,
  { excludes, logger, saveOnUnload }: PublicPrintOptions = {}
) {
  const outputs: Output[] = [console];
  if (saveOnUnload) {
    outputs.push(new ToFileOnUnloadOutput());
  }
  logger = logger ?? new Logger(outputs, excludes);
  const state = { shouldLogSet: true };
  return new Proxy(object, {
    ...functionHandler({ logger, state }),
    ...setHandler({ logger, state }),
  });
}

export function printInstanceMutations(
  klass: Class,
  options: PublicPrintOptions = {}
) {
  return new Proxy(klass, {
    construct(target, args) {
      return printMutations(new target(...args), options);
    },
  });
}
