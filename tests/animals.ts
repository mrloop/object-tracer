export class Animal {
  name = "";

  addFriend(friend: Animal) {
    this.friends.push(friend);
  }

  sleep(t?: number) {
    t;
    /* noop */
  }

  friends: Animal[] = [];

  static relationships(): string[] {
    return [];
  }
}

export class Dog extends Animal {
  totalBarks = 0;
  hasError = false;

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

export class Cat extends Animal {
  totalMeows = 0;

  meow() {
    this.totalMeows++;
    return "meyho";
  }

  toJSON() {
    return {
      totalMeows: this.totalMeows,
    };
  }
}

export class DogError extends Error {}
