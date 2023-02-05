export default class ToFileOnUnloadOutput {
    static instance;
    logs = [];
    link;
    constructor() {
        if (ToFileOnUnloadOutput.instance) {
            return ToFileOnUnloadOutput.instance;
        }
        ToFileOnUnloadOutput.instance = this;
        this.link = document.createElement("a");
        this.link.ariaHidden = "true";
        document.querySelector("body")?.appendChild(this.link);
        // @ts-ignore
        globalThis.objectTracer = {
            reset: this.reset.bind(this),
            download: this.download.bind(this),
        };
    }
    log(msg) {
        this.logs.push(msg);
    }
    reset() {
        this.logs = [];
    }
    download() {
        if (this.link) {
            this.link.download = this.fileName;
            this.link.href = this.objectUrl;
            this.link.click();
        }
    }
    get fileName() {
        const date = new Date().toISOString().split(".")[0].replace(/:| /g, "-");
        return `object-tracer-${date}.txt`;
    }
    get objectUrl() {
        return window.URL.createObjectURL(new Blob(this.logs, { type: "text/plain" }));
    }
}
