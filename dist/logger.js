import safeJsonValue from "safe-json-value";
export default class Logger {
    log;
    constructor(log) {
        this.log = log;
    }
    call({ propKey, klass, args, result, error, }) {
        this.log(`:${propKey} #${this.prototypeChain(klass).reduce(this.protoReducer, "")}
  from: ${this._line()}
  <=: ${this._format(args)}
  =>: ${this._format(result)}`);
    }
    mutation({ propKey, args, klass, diff, }) {
        this.log(`:${propKey} #${this.prototypeChain(klass).reduce(this.protoReducer, "")}
  from: ${this._line()}
  <=: ${this._format(args)}
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
    _format(value) {
        if (value === undefined || value === null)
            return value;
        return JSON.stringify(safeJsonValue(value).value).slice(1, -1);
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
