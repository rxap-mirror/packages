export enum BuildEntryPointStrategyExecutorSchemaEnum {
  EXPAND = 'expand',
  MERGE = 'merge',
  PACKAGES = 'packages',
  RESOLVE = 'resolve'
}

export interface BuildExecutorSchema {
  entryPoints?: Array<string>;
  outputPaths?: Array<string>;
  tsconfig: string;
  plugins?: Array<string>;
  json?: boolean;
  html?: boolean;
  skipErrorChecking?: boolean;
  markdown?: boolean;
  wiki?: boolean;
  includeVersion?: boolean;
  entryPointStrategy?: BuildEntryPointStrategyExecutorSchemaEnum;
}
