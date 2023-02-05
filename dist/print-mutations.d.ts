import { Class } from "./logger.js";
import { PublicPrintOptions } from "./print.js";
export declare function printSets(object: object, { logger }?: PublicPrintOptions): any;
export declare function printMutations(object: object, { excludes, logger, saveOnUnload }?: PublicPrintOptions): any;
export declare function printInstanceMutations(klass: Class, options?: PublicPrintOptions): Class;
