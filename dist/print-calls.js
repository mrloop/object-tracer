import isConstructor from "./is-constructor.js";
import Logger from "./logger.js";
import ToFileOnUnloadOutput from "./to-file-on-unload-output.js";
import Trace from "./trace.js";
function callHandler({ logger }) {
    return {
        get(target, propKey, receiver) {
            const targetValue = Reflect.get(target, propKey, receiver);
            if (!Trace.isPaused &&
                propKey !== "constructor" &&
                typeof targetValue === "function" &&
                !isConstructor(targetValue)) {
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
                        Trace.pause(() => logger.call({
                            propKey,
                            args,
                            klass: target.constructor,
                            ...(!!error && { error }),
                            ...(!error && { result }),
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
export function printCalls(object, { excludes, logger, saveOnUnload } = {}) {
    const outputs = [console];
    if (saveOnUnload) {
        outputs.push(new ToFileOnUnloadOutput());
    }
    logger = logger ?? new Logger(outputs, excludes);
    return new Proxy(object, callHandler({ logger }));
}
export function printInstanceCalls(klass, options = {}) {
    return new Proxy(klass, {
        construct(target, args) {
            return printCalls(new target(...args), options);
        },
    });
}
