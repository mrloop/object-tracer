export default class ToFileOnUnloadOutput {
    private static instance;
    logs: string[];
    link?: HTMLAnchorElement;
    constructor();
    log(msg: string): void;
    reset(): void;
    download(): void;
    get fileName(): string;
    get objectUrl(): string;
}
