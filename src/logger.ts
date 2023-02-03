import safeJsonValue from "safe-json-value";

export type Class = { new (...args: any[]): any };

export interface Output {
  log: (msg: string) => void;
}

type Exclude = string | RegExp;

export default class Logger {
  constructor(private outputs: Output[], private excludes: Exclude[] = []) {}

  private log(msg: string) {
    this.outputs.forEach((output) => {
      output.log(msg);
    });
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
  <=: ${this.format(args)}
  =>: ${this.format(result, this.excludes)}`);
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
  <=: ${this.format(args)}
  changes:\n${this.diffToString(diff)}`);
  }

  diffToString(diff: object) {
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

  private format(value?: string | object, excludes: Exclude[] = []) {
    if (value === undefined || value === null) return value;
    let result = JSON.stringify(
      safeJsonValue(value).value,
      this.replacer(excludes),
      2
    );
    if (value instanceof Array) {
      result = result?.slice(1, -1);
    }
    return result?.trim();
  }

  private replacer(excludes: Exclude[]) {
    return function replacerFn(key: string, value: any) {
      if (
        excludes.some(
          (exclude) =>
            (exclude instanceof RegExp && exclude.test(key)) || exclude === key
        )
      ) {
        return undefined;
      }
      return value;
    };
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
