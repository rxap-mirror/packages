export interface GenerateGeneratorSchema {
  /** Path to the json schema file */
  path: string;
  /** Path to the output typescript file. Defaults to the filename of the json schema where .json is replaced by .d.ts */
  output?: string;
  /** Suffix of the generate interface name */
  suffix?: string;
}
