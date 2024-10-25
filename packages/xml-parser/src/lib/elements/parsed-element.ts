import { KeyValue } from '@rxap/utilities';
import { RxapElement } from '../element';

export interface ParsedElement<Value = any> {

  __tag?: string;
  __parent?: ParsedElement;
  __xmlns?: Map<string, string>;

  postValidate?(): void;

  preValidate?(): void;

  postParse?(): void;

  preParse?(): void;

  preSerialize?(element: RxapElement): void;

  postSerialize?(element: RxapElement): void;

  validate?(): boolean;

  toValue?(context?: KeyValue): Value;

  toJSON?(): any;

}

export interface SafeParsedElement<Value = any> extends ParsedElement<Value> {

  __tag: string;
  __xmlns: Map<string, string>;

  toJSON(): any;

}
