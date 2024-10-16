export interface DefaultValueElementOptions<Value> {
  defaultValue?: Value;
}

export class DefaultValueElementMixin<Value> {

  public readonly options!: any;

  public get defaultValue(): Value | undefined {
    return this.options.defaultValue;
  }

}
