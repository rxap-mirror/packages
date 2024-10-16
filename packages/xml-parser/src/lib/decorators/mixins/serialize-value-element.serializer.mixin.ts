import { serializeValue } from '../../serialize-value';

export interface SerializeValueElementOptions<Value> {
  serializeValue?: (value: Value) => string;
}

export class SerializeValueElementSerializerMixin<Value> {

  constructor(readonly options: any = {}) {
  }

  public serializeValue(value: Value): string {
    if (this.options.serializeValue) {
      return this.options.serializeValue(value);
    }
    return serializeValue(value);
  }

}
