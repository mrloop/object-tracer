export class Animal {
  sleep() {}
}

export class Dog extends Animal {
  totalBarks = 0;

  sleep() {}

  bark() {
    this.totalBarks++;
    return "yap!";
  }

  error(error) {
    throw error;
  }
}

export class DogError extends Error {}
