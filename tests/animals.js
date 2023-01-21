export class Animal {
  sleep() {
    /* noop */
  }

  static relationships() {
    return [];
  }
}

export class Dog extends Animal {
  totalBarks = 0;
  hasError = false;

  sleep() {
    /* noop */
  }

  bark() {
    this.totalBarks++;
    return "yap!";
  }

  error(error) {
    this.hasError = true;
    throw error;
  }

  static relationships() {
    return ["owner"];
  }
}

export class DogError extends Error {}
