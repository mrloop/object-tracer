export type Class = {
    new (...args: any[]): any;
};
export interface Output {
    log: (msg: string) => void;
}
type Exclude = string | RegExp;
export default class Logger {
    private outputs;
    private excludes;
    constructor(outputs: Output[], excludes?: Exclude[]);
    private log;
    call({ propKey, klass, args, result, error, }: {
        propKey: string;
        klass: Class;
        args: any[];
        result?: any;
        error?: any;
    }): void;
    mutation({ propKey, args, klass, diff, }: {
        propKey: string;
        klass: Class;
        args: object;
        diff: object;
    }): void;
    diffToString(diff: object): any;
    _line(): string | undefined;
    private format;
    private replacer;
    protoReducer(str: string, klass: Class): string;
    prototypeChain(klass: Class): Class[];
}
export {};
