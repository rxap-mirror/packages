import {parseValue} from '../../parse-value';

export interface ParseValueElementOptions<Value> {
  parseValue?: (rawValue: string) => Value;
}

export class ParseValueElementParserMixin<Value> {

  constructor(readonly options: any = {}) {
  }

  public parseValue(rawValue: string): Value {
    if (this.options.parseValue) {
      return this.options.parseValue(rawValue);
    }
    return parseValue<Value>(rawValue);
  }

}
