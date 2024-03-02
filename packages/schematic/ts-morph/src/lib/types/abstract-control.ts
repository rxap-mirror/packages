import { TypeImport } from '@rxap/ts-morph';
import { WriterFunction } from 'ts-morph';

export interface AbstractControl {
  name: string;
  type?: string | TypeImport | WriterFunction;
  isArray?: boolean;
  state?: string | WriterFunction | null;
  isRequired?: boolean;
  validatorList?: string[];
}
