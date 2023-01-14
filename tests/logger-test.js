import QUnit from "qunit";

import Logger from "../src/logger.js";

let { module, test } = QUnit;

class TestConsole {
  logs = [];

  log(str) {
    this.logs.push(str);
  }

  getLines(index) {
    return this.logs[index].split("\n").map((s) => s.trim());
  }
}

module("Logger", function () {
  test("prototypeChain", function (assert) {
    class A {}
    class B extends A {}
    class C extends B {}
    let logger = new Logger();
    assert.deepEqual(logger.prototypeChain(C), [A, B, C]);
  });

  test("protoReducer", function (assert) {
    class A {}
    class B extends A {}
    class C extends B {}
    let logger = new Logger();
    assert.deepEqual(
      logger.prototypeChain(C).reduce(logger.protoReducer, ""),
      "A > B > C"
    );
  });

  module("log calls", function (hooks) {
    hooks.beforeEach(function () {
      this.testConsole = new TestConsole();
      this.logger = new Logger((msg) => this.testConsole.log(msg));
    });
    test("call", function (assert) {
      this.logger.call({
        args: [],
        propKey: "bark",
        klass: class Deer {},
        result: "yap!",
      });
      assert.strictEqual(this.testConsole.logs.length, 1);
      let lines = this.testConsole.getLines(0);
      assert.strictEqual(lines[0], ":bark #Deer");
      assert.true(/^from: at runTest/.test(lines[1]), lines[1]);
      assert.strictEqual(lines[2], "<=:");
      assert.strictEqual(lines[3], "=>: yap!");
    });

    test("mutation", function (assert) {
      this.logger.mutation({
        args: "frank",
        propKey: "name",
        klass: class Hat {},
        diff: {
          added: [],
          removed: [],
          edited: [["name", "fank", "frank"]],
        },
      });
      assert.strictEqual(this.testConsole.logs.length, 1);
      let lines = this.testConsole.getLines(0);
      assert.strictEqual(lines[0], ":name #Hat");
      assert.true(/^from: at runTest/.test(lines[1]), lines[1]);
      assert.strictEqual(lines[2], "<=: frank");
      assert.strictEqual(lines[3], "changes:");
      assert.strictEqual(lines[4], "@name: fank => frank");
    });
  });
});
