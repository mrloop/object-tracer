export default class TestLogger {
  calls = [];

  set(arg) {
    this.calls.push({ set: arg });
  }

  mutation(arg) {
    this.calls.push({ mutation: arg });
  }

  call(arg) {
    this.calls.push({ call: arg });
  }
}
