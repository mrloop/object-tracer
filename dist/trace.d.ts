interface CopyObject extends Object {
    serialize?: () => object;
}
export default class Trace {
    private static _isPaused;
    static get isPaused(): boolean;
    static pause<T>(fnc: () => T): T;
    static copy(obj: CopyObject): object;
}
export {};
