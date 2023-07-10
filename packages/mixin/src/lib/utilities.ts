export interface Constructor<T> extends Function {
  new(...args: any[]): T;
}

export type Mixin<T> = Constructor<T> | object;
