import safeJsonValue from "safe-json-value";
export default class Trace {
    static _isPaused = false;
    static get isPaused() {
        return this._isPaused;
    }
    /* Don't log function calls made when logging */
    static pause(fnc) {
        const original = this._isPaused;
        try {
            this._isPaused = true;
            return fnc();
        }
        finally {
            this._isPaused = original;
        }
    }
    static copy(obj) {
        return this.pause(() => {
            // TODO serialize is emberjs only
            // inject serialize and other framework specific methods
            return safeJsonValue(obj).value || obj.serialize?.() || {};
        });
    }
}
