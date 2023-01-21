import { getDiff } from "json-difference";
import QUnit from "qunit";

import { printMutations, printInstanceMutations } from "../index.js";
import { Dog, DogError } from "./animals.js";
import TestLogger from "./test-logger.js";

let { module, test } = QUnit;

module("printMutations", function () {
  module("all class instances", function (hooks) {
    hooks.beforeEach(function () {
      this.logger = new TestLogger();
      this.Dog = printInstanceMutations(Dog, { logger: this.logger });
      this.dog = new this.Dog();
    });

    test("called once", function (assert) {
      let bark = this.dog.bark();

      assert.strictEqual(bark, "yap!", "result returned");
      assert.deepEqual(this.logger.calls, [
        {
          mutation: {
            propKey: "bark",
            klass: Dog,
            args: [],
            diff: {
              added: [],
              removed: [],
              edited: [["totalBarks", 0, 1]],
            },
          },
        },
      ]);
    });

    test("handles calls to constructor", function (assert) {
      this.dog.constructor.relationships();
      assert.deepEqual(this.logger.calls, []);
    });
  });

  module("individual instances", function (hooks) {
    hooks.beforeEach(function () {
      let dog = new Dog();
      this.logger = new TestLogger();
      this.dog = printMutations(dog, { logger: this.logger });
    });

    test("mutates property via function call", function (assert) {
      let bark = this.dog.bark();

      assert.strictEqual(bark, "yap!", "result returned");
      assert.deepEqual(this.logger.calls, [
        {
          mutation: {
            propKey: "bark",
            klass: Dog,
            args: [],
            diff: {
              added: [],
              removed: [],
              edited: [["totalBarks", 0, 1]],
            },
          },
        },
      ]);
    });

    test("mutates property directly", function (assert) {
      this.dog.totalBarks++;

      assert.deepEqual(this.logger.calls, [
        {
          mutation: {
            propKey: "totalBarks",
            klass: Dog,
            args: 1,
            diff: {
              added: [],
              removed: [],
              edited: [["totalBarks", 0, 1]],
            },
          },
        },
      ]);
    });

    test("multiple calls", function (assert) {
      this.dog.bark();
      this.dog.sleep();
      this.dog.bark();

      let expected = [
        {
          mutation: {
            propKey: "bark",
            klass: Dog,
            args: [],
            diff: {
              added: [],
              removed: [],
              edited: [["totalBarks", 0, 1]],
            },
          },
        },
        {
          mutation: {
            propKey: "sleep",
            klass: Dog,
            args: [],
            diff: {
              added: [],
              removed: [],
              edited: [],
            },
          },
        },
        {
          mutation: {
            propKey: "bark",
            klass: Dog,
            args: [],
            diff: {
              added: [],
              removed: [],
              edited: [["totalBarks", 1, 2]],
            },
          },
        },
      ];

      assert.deepEqual(
        this.logger.calls,
        expected,
        getDiff(this.logger.calls, expected)
      );
    });

    test("function invocation cause error", function (assert) {
      let err = new DogError("dog");
      assert.throws(() => this.dog.error(err), DogError);
      assert.deepEqual(this.logger.calls, [
        {
          mutation: {
            propKey: "error",
            klass: Dog,
            args: [err],
            error: err,
            diff: {
              added: [],
              removed: [],
              edited: [["hasError", false, true]],
            },
          },
        },
      ]);
    });

    test("cyclic references", function (assert) {
      let dogA = printMutations(new Dog(), { logger: this.logger });
      let dogB = new Dog();
      dogA.friends = [dogB];
      dogB.friends = [dogA];

      let bark = dogA.bark();

      assert.strictEqual(bark, "yap!", "result returned");

      assert.deepEqual(this.logger.calls[1], {
        mutation: {
          propKey: "bark",
          klass: Dog,
          args: [],
          diff: {
            added: [],
            removed: [],
            edited: [["totalBarks", 0, 1]],
          },
        },
      });
    });
  });
});
