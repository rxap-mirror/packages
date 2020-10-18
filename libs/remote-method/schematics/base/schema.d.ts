export interface BaseSchema {
  path?: string;
  project?: string;
  name: string;
  collection: boolean;
  template: boolean;
  returnType: string;
  parametersType: string;
  export: boolean;
}
