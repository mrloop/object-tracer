import { getDiff } from "json-difference";
import isConstructor from "./is-constructor.js";
import Logger from "./logger.js";
import ToFileOnUnloadOutput from "./to-file-on-unload-output.js";
import Trace from "./trace.js";
function setHandler({ logger, state }) {
    return {
        set(target, propKey, value, receiver) {
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
            }
            else {
                return Reflect.set(target, propKey, value, receiver);
            }
        },
    };
}
export function printSets(object, { logger } = {}) {
    logger = logger ?? new Logger([console]);
    return new Proxy(object, setHandler({ logger }));
}
function functionHandler({ logger, state }) {
    return {
        get(target, propKey, receiver) {
            const targetValue = Reflect.get(target, propKey, receiver);
            if (!Trace.isPaused &&
                propKey !== "constructor" &&
                typeof targetValue === "function" &&
                !isConstructor(targetValue)) {
                return function (...args) {
                    const originalState = Trace.copy(receiver);
                    let error;
                    try {
                        return pauseLogSet(() => targetValue.apply(this, args), state);
                    }
                    catch (err) {
                        error = err;
                        throw err;
                    }
                    finally {
                        const newState = Trace.copy(receiver);
                        Trace.pause(() => logger.mutation({
                            propKey,
                            args,
                            ...(!!error && { error }),
                            klass: target.constructor,
                            diff: getDiff(originalState, newState),
                        }));
                    }
                };
            }
            else {
                return targetValue;
            }
        },
    };
}
/* Don't log a `set` triggered by a `get` */
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
export function printMutations(object, { excludes, logger, saveOnUnload } = {}) {
    const outputs = [console];
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
export function printInstanceMutations(klass, options = {}) {
    return new Proxy(klass, {
        construct(target, args) {
            return printMutations(new target(...args), options);
        },
    });
}
