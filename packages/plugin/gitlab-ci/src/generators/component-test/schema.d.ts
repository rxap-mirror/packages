export interface ComponentTestGeneratorSchema {
  /** A list of browsers to test against */
  browserList: Array<ComponentTestBrowserListGeneratorSchemaEnum>;
  /** A list of projects to exclude from the ci configuration */
  excludeList?: Array<string>;
  /** The cypress image to use for the tests */
  cypressImage?: string;
}
export enum ComponentTestBrowserListGeneratorSchemaEnum {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  EDGE = 'edge'
}
