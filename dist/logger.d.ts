export type Class = {
    new (...args: any[]): any;
};
export default class Logger {
    log: (msg: string) => void;
    constructor(log: (msg: string) => void);
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
    _format(value?: string | object): string | undefined;
    protoReducer(str: string, klass: Class): string;
    prototypeChain(klass: Class): Class[];
}
