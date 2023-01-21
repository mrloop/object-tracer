export class Animal {
  sleep() {}
}

export class Dog extends Animal {
  totalBarks = 0;
  hasError = false;

  sleep() {}

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
