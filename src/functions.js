import { getDiff } from "json-difference";

import Logger from "./logger.js";

function callHandler({ logger }) {
  return {
    get(target, propKey, receiver) {
      const targetValue = Reflect.get(target, propKey, receiver);
      if (typeof targetValue === "function") {
        return function (...args) {
          try {
            let result = targetValue.apply(this, args);
            logger.call({ propKey, args, klass: target.constructor, result });
            return result;
          } catch (error) {
            logger.call({ propKey, args, klass: target.constructor, error });
            throw error;
          }
        };
      } else {
        return targetValue;
      }
    },
  };
}

export function printCalls(object, { logger } = {}) {
  logger = logger ?? new Logger(console.log);
  return new Proxy(object, callHandler({ logger }));
}

export function printInstanceCalls(klass, { logger } = {}) {
  logger = logger ?? new Logger(console.log);
  return new Proxy(klass, {
    construct(target, args) {
      return printCalls(new target(...args), { logger });
    },
  });
}

function setHandler({ logger, state }) {
  return {
    set(target, propKey, value, receiver) {
      if (state.shouldLogSet) {
        let originalState = JSON.parse(JSON.stringify(target));
        let result = Reflect.set(target, propKey, value, receiver);
        let newState = JSON.parse(JSON.stringify(target));
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

export function printSets(object, { logger } = {}) {
  logger = logger ?? new Logger(console.log);
  return new Proxy(object, setHandler({ logger }));
}

function functionHandler({ logger, state }) {
  return {
    get(target, propKey, receiver) {
      const targetValue = Reflect.get(target, propKey, receiver);
      if (typeof targetValue === "function") {
        return function (...args) {
          let originalState = JSON.parse(JSON.stringify(target));
          let result = pauseLogSet(() => targetValue.apply(this, args), state);
          let newState = JSON.parse(JSON.stringify(target));
          logger.mutation({
            propKey,
            args,
            klass: target.constructor,
            diff: getDiff(originalState, newState),
          });
          return result;
        };
      } else {
        return targetValue;
      }
    },
  };
}

function pauseLogSet(fnc, state) {
  let original = state.shouldLogSet;
  try {
    state.shouldLogSet = false;
    return fnc();
  } finally {
    state.shouldLogSet = original;
  }
}

export function printMutations(object, { logger } = {}) {
  logger = logger ?? new Logger(console.log);
  let state = { shouldLogSet: true };
  return new Proxy(object, {
    ...functionHandler({ logger, state }),
    ...setHandler({ logger, state }),
  });
}

export function printInstanceMutations(klass, { logger } = {}) {
  logger = logger ?? new Logger(console.log);
  return new Proxy(klass, {
    construct(target, args) {
      return printMutations(new target(...args), { logger });
    },
  });
}
