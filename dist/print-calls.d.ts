import { Class } from "./logger.js";
import { PublicPrintOptions } from "./print.js";
export declare function printCalls(object: object, { excludes, logger, saveOnUnload }?: PublicPrintOptions): any;
export declare function printInstanceCalls(klass: Class, options?: PublicPrintOptions): Class;
