export type Class = { new (...args: any[]): any };

export default class Logger {
  log: (msg: string) => void;

  constructor(log: (msg: string) => void) {
    this.log = log;
  }

  call({
    propKey,
    klass,
    args,
    result,
    error,
  }: {
    propKey: string;
    klass: Class;
    args: any[];
    result?: any;
    error?: any;
  }) {
    this.log(`:${propKey} #${this.prototypeChain(klass).reduce(
      this.protoReducer,
      ""
    )}
  from: ${this._line()}
  <=: ${this._format(args)}
  =>: ${this._format(result)}`);
  }

  mutation({
    propKey,
    args,
    klass,
    diff,
  }: {
    propKey: string;
    klass: Class;
    args: object;
    diff: object;
  }) {
    this.log(`:${propKey} #${this.prototypeChain(klass).reduce<string>(
      this.protoReducer,
      ""
    )}
  from: ${this._line()}
  <=: ${this._format(args)}
  changes:\n${this.diffToString(diff)}`);
  }

  private diffToString(diff: object) {
    return Object.values(diff)
      .reduce((arr, typeOfMutationArray) => {
        return typeOfMutationArray.reduce(
          (
            arr: string[],
            [name, start, end]: [name: string, start: string, end: string]
          ) => {
            arr.push(`@${name}: ${start} => ${end}`);
            return arr;
          },
          arr
        );
      })
      .sort();
  }

  _line() {
    return new Error().stack?.split("\n")[4].trim();
  }

  _format(value?: string | object) {
    if (value === undefined || value === null) return value;
    return JSON.stringify(value).slice(1, -1);
  }

  protoReducer(str: string, klass: Class) {
    if (str === "") return klass.name;
    return `${str} > ${klass.name}`;
  }

  prototypeChain(klass: Class) {
    const chain = [klass];
    let k: undefined | Class = klass;
    while (k !== undefined) {
      k = Object.getPrototypeOf(k);
      if (k?.prototype) {
        chain.unshift(k);
      } else {
        k = undefined;
      }
    }
    return chain;
  }
}
