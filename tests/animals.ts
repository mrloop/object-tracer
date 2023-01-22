export class Animal {
  sleep(t?: number) {
    t;
    /* noop */
  }

  static relationships(): string[] {
    return [];
  }
}

export class Dog extends Animal {
  totalBarks = 0;
  hasError = false;
  friends: Dog[] = [];

  bark() {
    this.totalBarks++;
    return "yap!";
  }

  error(error: Error) {
    this.hasError = true;
    throw error;
  }

  static relationships() {
    return ["owner"];
  }
}

export class DogError extends Error {}
