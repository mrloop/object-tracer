import Logger from "./logger.js";

export type PublicPrintOptions = {
  logger?: Logger;
  saveOnUnload?: boolean;
  excludes?: string[];
};
