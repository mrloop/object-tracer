import QUnit from "qunit";

import { printInstanceCalls } from "../src/index.js";
import Logger, { Class } from "../src/logger.js";
import { Cat } from "./animals.js";

class TestLogger extends Logger {
  logs: string[] = [];

  constructor() {
    super([
      {
        log: (msg: string) => {
          this.logs.push(msg);
        },
      },
    ]);
  }
}

const { module, test } = QUnit;

type TestContext = {
  logger: TestLogger;
  Cat: Class;
  cat: Cat;
};

module("Integration | printInstanceCalls", function () {
  module("all class instances", function (hooks) {
    hooks.beforeEach(function (this: TestContext) {
      this.logger = new TestLogger();
      this.Cat = printInstanceCalls(Cat, { logger: this.logger });
      this.cat = new this.Cat();
    });

    test("functions triggered by logger are not logged", function (this: TestContext, assert) {
      this.cat.addFriend(new this.Cat());
      assert.false(
        this.logger.logs.some((msg: string) => msg.includes("toJSON")),
        this.logger.logs.join("\n")
      );
    });
  });
});
