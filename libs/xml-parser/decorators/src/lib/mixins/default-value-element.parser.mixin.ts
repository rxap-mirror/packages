export interface DefaultValueElementOptions<Value> {
  defaultValue?: Value;
}

export class DefaultValueElementParserMixin<Value> {

  public get defaultValue(): Value | undefined {
    return this.options.defaultValue;
  }

  public readonly options!: any;

}
