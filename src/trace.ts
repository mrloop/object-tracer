import safeJsonValue from "safe-json-value";

interface CopyObject extends Object {
  serialize?: () => object;
}

export default class Trace {
  private static _isPaused = false;

  static get isPaused() {
    return this._isPaused;
  }

  /* Don't log function calls made when logging */
  static pause<T>(fnc: () => T): T {
    const original = this._isPaused;
    try {
      this._isPaused = true;
      return fnc();
    } finally {
      this._isPaused = original;
    }
  }

  static copy(obj: CopyObject): object {
    return this.pause(() => {
      // TODO serialize is emberjs only
      // inject serialize and other framework specific methods
      return safeJsonValue(obj).value || obj.serialize?.() || {};
    });
  }
}
