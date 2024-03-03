import { DataProperty } from '@rxap/ts-morph';
import { WriterFunction } from 'ts-morph';

export interface AbstractControl extends DataProperty {
  state?: string | WriterFunction | null;
  isRequired?: boolean;
  validatorList?: string[];
  role?: 'control' | 'group' | 'array';
}
