import { getDiff } from "json-difference";
import safeJsonValue from "safe-json-value";

import Logger, { Class } from "./logger.js";

type State = {
  shouldLogSet: boolean;
};

type PublicPrintOptions = {
  logger?: Logger;
};

function copy(obj: object): object {
  return safeJsonValue(obj).value || {};
}

function callHandler({ logger }: { logger: Logger }) {
  return {
    get(target: any, propKey: string, receiver: any) {
      const targetValue = Reflect.get(target, propKey, receiver);
      if (propKey === "constructor") return targetValue; // TODO should we log static methods?
      if (typeof targetValue === "function") {
        return function (this: any, ...args: any[]) {
          let error;
          let result;
          try {
            result = targetValue.apply(this, args);
            return result;
          } catch (err) {
            error = err;
            throw err;
          } finally {
            logger.call({
              propKey,
              args,
              klass: target.constructor as Class,
              ...(!!error && { error }),
              ...(!error && { result }),
            });
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
  logger = logger ?? new Logger(console.log);
  return new Proxy(object, callHandler({ logger }));
}

export function printInstanceCalls(
  klass: Class,
  { logger }: PublicPrintOptions = {}
) {
  logger = logger ?? new Logger(console.log);
  return new Proxy(klass, {
    construct(target, args) {
      return printCalls(new target(...args), { logger });
    },
  });
}

function setHandler({ logger, state }: { logger: Logger; state?: State }) {
  return {
    set(target: any, propKey: string, value: any, receiver: any) {
      if (state?.shouldLogSet) {
        const originalState = copy(receiver);
        const result = Reflect.set(target, propKey, value, receiver);
        const newState = copy(receiver);
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
  logger = logger ?? new Logger(console.log);
  return new Proxy(object, setHandler({ logger }));
}

function functionHandler({ logger, state }: { logger: Logger; state: State }) {
  return {
    get(target: any, propKey: string, receiver: any) {
      const targetValue = Reflect.get(target, propKey, receiver);
      if (propKey === "constructor") return targetValue;
      if (typeof targetValue === "function") {
        return function (this: any, ...args: any[]) {
          const originalState = copy(receiver);
          let error;
          try {
            return pauseLogSet(() => targetValue.apply(this, args), state);
          } catch (err) {
            error = err;
            throw err;
          } finally {
            const newState = copy(receiver);
            logger.mutation({
              propKey,
              args,
              ...(!!error && { error }),
              klass: target.constructor,
              diff: getDiff(originalState, newState),
            });
          }
        };
      } else {
        return targetValue;
      }
    },
  };
}

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
  { logger }: PublicPrintOptions = {}
) {
  logger = logger ?? new Logger(console.log);
  const state = { shouldLogSet: true };
  return new Proxy(object, {
    ...functionHandler({ logger, state }),
    ...setHandler({ logger, state }),
  });
}

export function printInstanceMutations(
  klass: Class,
  { logger }: PublicPrintOptions = {}
) {
  logger = logger ?? new Logger(console.log);
  return new Proxy(klass, {
    construct(target, args) {
      return printMutations(new target(...args), { logger });
    },
  });
}
