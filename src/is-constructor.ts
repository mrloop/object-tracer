// https://stackoverflow.com/a/48036194/1783908
const handler = {
  construct() {
    //Must return ANY object, so reuse one
    return handler;
  },
};

// test if constructor without invoking the constructor
export default function isConstructor(maybeConstructor: any) {
  try {
    return !!new new Proxy(maybeConstructor, handler)();
  } catch (e) {
    return false;
  }
}
