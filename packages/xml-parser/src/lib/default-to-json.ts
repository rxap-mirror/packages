import { getMetadata } from '@rxap/reflect-metadata';
import { ElementParser } from './decorators/element.parser';
import {
  ElementParserMetaData,
} from './decorators/metadata-keys';
import { ParsedElement } from './elements/parsed-element';

export function defaultToJson(this: ParsedElement): any {
  const json: any = {
    __tag: this.__tag,
    __parent: this.__parent?.__tag,
    __xmlns: Array.from(this.__xmlns?.entries() ?? []).reduce((acc, [ key, value ]) => ({ ...acc, [ key ]: value }), {}),
  };

  const parserInstances = getMetadata<ElementParser[]>(ElementParserMetaData.PARSER_INSTANCE, this as any) ?? [];

  const toJson = (value: any): any => {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map((v: any) => toJson(v));
      } else if ('toJSON' in value) {
        return value.toJSON();
      }
    }
    return value;
  } ;

  for (const parser of parserInstances) {
    const propertyKey = parser.propertyKey;
    const value = (this as any)[propertyKey];
    json[propertyKey] = toJson(value);
  }

  return json;
}
