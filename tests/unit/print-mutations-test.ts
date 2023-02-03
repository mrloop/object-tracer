import { getDiff } from "json-difference";
import QUnit from "qunit";

import { printMutations, printInstanceMutations } from "../../src/index.js";
import { Class } from "../../src/logger.js";
import { Dog, DogError } from "../animals.js";
import TestLogger from "./test-logger.js";

const { module, test } = QUnit;

type TestContext = {
  logger: TestLogger;
  Dog: Class;
  dog: Dog;
};

module("Unit | printMutations", function () {
  module("all class instances", function (hooks) {
    hooks.beforeEach(function (this: TestContext) {
      this.logger = new TestLogger();
      this.Dog = printInstanceMutations(Dog, { logger: this.logger });
      this.dog = new this.Dog();
    });

    test("called once", function (this: TestContext, assert) {
      const bark = this.dog.bark();

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

    test("handles calls to constructor", function (this: TestContext, assert) {
      //@ts-ignore
      this.dog.constructor.relationships();
      assert.deepEqual(this.logger.calls, []);
    });
  });

  module("individual instances", function (hooks) {
    hooks.beforeEach(function (this: TestContext) {
      const dog = new Dog();
      this.logger = new TestLogger();
      this.dog = printMutations(dog, { logger: this.logger });
    });

    test("mutates property via function call", function (this: TestContext, assert) {
      const bark = this.dog.bark();

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

    test("mutates property directly", function (this: TestContext, assert) {
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

    test("multiple calls", function (this: TestContext, assert) {
      this.dog.bark();
      this.dog.sleep();
      this.dog.bark();

      const expected = [
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
        JSON.stringify(getDiff(this.logger.calls, expected))
      );
    });

    test("function invocation cause error", function (this: TestContext, assert) {
      const err = new DogError("dog");
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

    test("cyclic references", function (this: TestContext, assert) {
      const dogA = printMutations(new Dog(), { logger: this.logger });
      const dogB = new Dog();
      dogA.friends = [dogB];
      dogB.friends = [dogA];

      const bark = dogA.bark();

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
