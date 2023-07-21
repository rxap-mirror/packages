import { WriterFunction } from 'ts-morph';

export interface FormDefinitionControl {
  name: string;
  type?: string | WriterFunction;
  isArray?: boolean;
  state?: string | WriterFunction | null;
  isRequired?: boolean;
  validatorList?: string[];
}

export interface FormDefinitionOptions {
  name: string;
  project: string;
  feature: string;
  shared?: boolean;
  directory?: string;
  controlList: Array<string | FormDefinitionControl>;
}
