import QUnit from "qunit";

import { printCalls, printInstanceCalls } from "../index.js";
import { Dog, DogError } from "./animals.js";
import TestLogger from "./test-logger.js";

let { module, test } = QUnit;

module("printCalls", function () {
  module("all class instances", function (hooks) {
    hooks.beforeEach(function () {
      this.logger = new TestLogger();
      this.Dog = printInstanceCalls(Dog, { logger: this.logger });
      this.dog = new this.Dog();
    });

    test("called once", function (assert) {
      this.dog.sleep(120);

      assert.deepEqual(this.logger.calls, [
        {
          call: {
            propKey: "sleep",
            klass: Dog,
            args: [120],
            result: undefined,
          },
        },
      ]);
    });

    test("handles calls to constructor", function (assert) {
      this.dog.constructor.relationships();
      assert.deepEqual(this.logger.calls, []);
    });
  });

  module("individual instance", function (hooks) {
    hooks.beforeEach(function () {
      let dog = new Dog();
      this.logger = new TestLogger();
      this.dog = printCalls(dog, { logger: this.logger });
    });

    test("called once", function (assert) {
      this.dog.sleep(120);

      assert.deepEqual(this.logger.calls, [
        {
          call: {
            propKey: "sleep",
            klass: Dog,
            args: [120],
            result: undefined,
          },
        },
      ]);
    });

    test("multiple calls", function (assert) {
      this.dog.sleep(245);
      let bark = this.dog.bark();
      this.dog.sleep(123);

      assert.strictEqual(bark, "yap!");
      assert.deepEqual(this.logger.calls, [
        {
          call: {
            propKey: "sleep",
            klass: Dog,
            args: [245],
            result: undefined,
          },
        },
        {
          call: {
            propKey: "bark",
            klass: Dog,
            args: [],
            result: "yap!",
          },
        },
        {
          call: {
            propKey: "sleep",
            klass: Dog,
            args: [123],
            result: undefined,
          },
        },
      ]);
    });

    test("function invocation causes error", function (assert) {
      let err = new DogError("dog");
      assert.throws(() => this.dog.error(err), DogError);

      assert.deepEqual(this.logger.calls, [
        {
          call: {
            propKey: "error",
            klass: Dog,
            args: [err],
            error: err,
          },
        },
      ]);
    });
  });
});
