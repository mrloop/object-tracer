export default class Logger {
  constructor(log) {
    this.log = log;
  }

  call({ propKey, klass, args, result }) {
    this.log(`:${propKey} #${this.prototypeChain(klass).reduce(
      this.protoReducer,
      ""
    )}
  from: ${this._line()}
  <=: ${this._format(args)}
  =>: ${this._format(result)}`);
  }

  mutation({ propKey, args, klass, diff }) {
    this.log(`:${propKey} #${this.prototypeChain(klass).reduce(
      this.protoReducer,
      ""
    )}
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
    return new Error().stack.split("\n")[4].trim();
  }

  _format(value) {
    if (value === undefined || value === null) return value;
    return JSON.stringify(value).slice(1, -1);
  }

  protoReducer(str, klass) {
    if (str === "") return klass.name;
    return `${str} > ${klass.name}`;
  }

  prototypeChain(klass) {
    let chain = [klass];
    while (klass) {
      klass = Object.getPrototypeOf(klass);
      if (klass.prototype) {
        chain.unshift(klass);
      } else {
        klass = null;
      }
    }
    return chain;
  }
}
