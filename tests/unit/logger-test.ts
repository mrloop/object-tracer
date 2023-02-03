import QUnit from "qunit";

import Logger from "../../src/logger.js";

const { module, test } = QUnit;

class TestConsole {
  logs: string[] = [];

  log(str: string) {
    this.logs.push(str);
  }

  getLines(index: number) {
    return this.logs[index].split("\n").map((s) => s.trim());
  }

  getOutputLines(index: number) {
    const lines = this.getLines(index);
    const startOutputIndex = lines.findIndex((v) => /=>:/.test(v));
    return lines.slice(startOutputIndex);
  }
}

module("Unit | Logger", function () {
  test("prototypeChain", function (assert) {
    class A {}
    class B extends A {}
    class C extends B {}
    const console = new TestConsole();
    const logger = new Logger([console]);
    assert.deepEqual(logger.prototypeChain(C), [A, B, C]);
  });

  test("protoReducer", function (assert) {
    class A {}
    class B extends A {}
    class C extends B {}
    const console = new TestConsole();
    const logger = new Logger([console]);
    assert.deepEqual(
      logger.prototypeChain(C).reduce(logger.protoReducer, ""),
      "A > B > C"
    );
  });

  module("log calls", function (hooks) {
    type TestContext = {
      testConsole: TestConsole;
      logger: Logger;
    };

    hooks.beforeEach(function (this: TestContext) {
      this.testConsole = new TestConsole();
    });

    module("call function", function () {
      test("it works", function (this: TestContext, assert) {
        const logger = new Logger([this.testConsole]);
        logger.call({
          args: [],
          propKey: "bark",
          klass: class Deer {},
          result: "yap!",
        });
        assert.strictEqual(this.testConsole.logs.length, 1);
        const lines = this.testConsole.getLines(0);
        assert.strictEqual(lines[0], ":bark #Deer");
        assert.true(/^from: at runTest/.test(lines[1]), lines[1]);
        assert.strictEqual(lines[2], "<=:");
        assert.strictEqual(lines[3], '=>: "yap!"');
      });

      test("excludes string is excludes key from changes output", function (this: TestContext, assert) {
        const logger = new Logger([this.testConsole], ["store"]);
        logger.call({
          args: [],
          propKey: "bark",
          klass: class Deer {},
          result: {
            store: "not-included",
            noise: "yap!",
          },
        });
        assert.strictEqual(
          this.testConsole.getOutputLines(0).join(" "),
          '=>: { "noise": "yap!" }'
        );
      });
    });

    module("mutation function", function () {
      test("it works", function (this: TestContext, assert) {
        const logger = new Logger([this.testConsole]);
        logger.mutation({
          args: ["frank"],
          propKey: "name",
          klass: class Hat {},
          diff: {
            added: [],
            removed: [],
            edited: [["name", "fank", "frank"]],
          },
        });
        assert.strictEqual(this.testConsole.logs.length, 1);
        const lines = this.testConsole.getLines(0);
        assert.strictEqual(lines[0], ":name #Hat");
        assert.true(/^from: at runTest/.test(lines[1]), lines[1]);
        assert.strictEqual(lines[2], '<=: "frank"');
        assert.strictEqual(lines[3], "changes:");
        assert.strictEqual(lines[4], "@name: fank => frank");
      });
    });
  });
});
