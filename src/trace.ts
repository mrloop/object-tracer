import safeJsonValue from "safe-json-value";

export default class Trace {
  private static _isPaused = false;

  static get isPaused() {
    return this._isPaused;
  }

  /* Don't log function calls made when logging */
  static pause(fnc: () => any) {
    const original = this._isPaused;
    try {
      this._isPaused = true;
      return fnc();
    } finally {
      this._isPaused = original;
    }
  }

  static copy(obj: object): object {
    return this.pause(() => safeJsonValue(obj).value || {});
  }
}
