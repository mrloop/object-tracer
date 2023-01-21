interface Logger {
  call(args: object): void;
  mutation(args: object): void;
  trace(args: object): void;
}

interface Options {
  logger?: Logger;
}

function printCall<T extends object>(object: T, options: Options): T;
function printInstanceCalls<C extends Class>(klass: C): C;
