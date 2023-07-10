// eslint-disable-next-line @typescript-eslint/ban-types
export interface Constructor<T> extends Function {
  new(...args: any[]): T;
}

export type Mixin<T> = Constructor<T> | object;
