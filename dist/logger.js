import safeJsonValue from "safe-json-value";
export default class Logger {
    outputs;
    excludes;
    constructor(outputs, excludes = []) {
        this.outputs = outputs;
        this.excludes = excludes;
    }
    log(msg) {
        this.outputs.forEach((output) => {
            output.log(msg);
        });
    }
    call({ propKey, klass, args, result, error, }) {
        this.log(`:${propKey} #${this.prototypeChain(klass).reduce(this.protoReducer, "")}
  from: ${this._line()}
  <=: ${this.format(args)}
  =>: ${this.format(result, this.excludes)}`);
    }
    mutation({ propKey, args, klass, diff, }) {
        this.log(`:${propKey} #${this.prototypeChain(klass).reduce(this.protoReducer, "")}
  from: ${this._line()}
  <=: ${this.format(args)}
  changes:\n${this.diffToString(diff)}`);
    }
    diffToString(diff) {
        return Object.values(diff)
            .reduce((arr, typeOfMutationArray) => {
            return typeOfMutationArray.reduce((arr, [name, start, end]) => {
                arr.push(`@${name}: ${start} => ${end}`);
                return arr;
            }, arr);
        })
            .sort();
    }
    _line() {
        return new Error().stack?.split("\n")[4].trim();
    }
    format(value, excludes = []) {
        if (value === undefined || value === null)
            return value;
        let result = JSON.stringify(safeJsonValue(value).value, this.replacer(excludes), 2);
        if (value instanceof Array) {
            result = result?.slice(1, -1);
        }
        return result?.trim();
    }
    replacer(excludes) {
        return function replacerFn(key, value) {
            if (excludes.some((exclude) => (exclude instanceof RegExp && exclude.test(key)) || exclude === key)) {
                return undefined;
            }
            return value;
        };
    }
    protoReducer(str, klass) {
        if (str === "")
            return klass.name;
        return `${str} > ${klass.name}`;
    }
    prototypeChain(klass) {
        const chain = [klass];
        let k = klass;
        while (k !== undefined) {
            k = Object.getPrototypeOf(k);
            if (k?.prototype) {
                chain.unshift(k);
            }
            else {
                k = undefined;
            }
        }
        return chain;
    }
}
