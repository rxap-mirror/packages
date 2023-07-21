import { WriterFunction } from 'ts-morph';

export interface FormComponentControl {
  name: string;
  type?: string | WriterFunction;
  isRequired?: boolean;
  state?: string | WriterFunction | null;
  validatorList?: string[];
}

export interface FormComponentOptions {
  name: string;
  project: string;
  feature: string;
  window: boolean;
  directory?: string | null;
  controlList?: Array<string | FormComponentControl>;
  shared?: boolean;
  role?: string | null;
  nestModule?: string | null;
  controllerName?: string;
  context?: string;
}
