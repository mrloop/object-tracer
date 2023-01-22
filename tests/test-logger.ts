import Logger from "../src/logger.js";

export default class TestLogger extends Logger {
  calls: { [key: string]: any }[] = [];

  constructor() {
    super(() => {
      /**/
    });
  }

  set(arg: any) {
    this.calls.push({ set: arg });
  }

  mutation(arg: any) {
    this.calls.push({ mutation: arg });
  }

  call(arg: any) {
    this.calls.push({ call: arg });
  }
}
