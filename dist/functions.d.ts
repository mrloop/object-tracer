import Logger, { Class } from "./logger.js";
type PublicPrintOptions = {
    logger?: Logger;
};
export declare function printCalls(object: object, { logger }?: PublicPrintOptions): any;
export declare function printInstanceCalls(klass: Class, { logger }?: PublicPrintOptions): Class;
export declare function printSets(object: object, { logger }?: PublicPrintOptions): any;
export declare function printMutations(object: object, { logger }?: PublicPrintOptions): any;
export declare function printInstanceMutations(klass: Class, { logger }?: PublicPrintOptions): Class;
export {};
