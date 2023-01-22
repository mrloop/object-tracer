import { getDiff } from "json-difference";
import safeJsonValue from "safe-json-value";
import Logger from "./logger.js";
function copy(obj) {
    return safeJsonValue(obj).value || {};
}
function callHandler({ logger }) {
    return {
        get(target, propKey, receiver) {
            const targetValue = Reflect.get(target, propKey, receiver);
            if (propKey === "constructor")
                return targetValue; // TODO should we log static methods?
            if (typeof targetValue === "function") {
                return function (...args) {
                    let error;
                    let result;
                    try {
                        result = targetValue.apply(this, args);
                        return result;
                    }
                    catch (err) {
                        error = err;
                        throw err;
                    }
                    finally {
                        logger.call({
                            propKey,
                            args,
                            klass: target.constructor,
                            ...(!!error && { error }),
                            ...(!error && { result }),
                        });
                    }
                };
            }
            else {
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
            }
            else {
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
            if (propKey === "constructor")
                return targetValue;
            if (typeof targetValue === "function") {
                return function (...args) {
                    const originalState = copy(receiver);
                    let error;
                    try {
                        return pauseLogSet(() => targetValue.apply(this, args), state);
                    }
                    catch (err) {
                        error = err;
                        throw err;
                    }
                    finally {
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
            }
            else {
                return targetValue;
            }
        },
    };
}
function pauseLogSet(fnc, state) {
    const original = state.shouldLogSet;
    try {
        state.shouldLogSet = false;
        return fnc();
    }
    finally {
        state.shouldLogSet = original;
    }
}
export function printMutations(object, { logger } = {}) {
    logger = logger ?? new Logger(console.log);
    const state = { shouldLogSet: true };
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