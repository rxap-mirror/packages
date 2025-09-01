export interface DynamicConfigurationModuleGeneratorSchema {
  project: string;
  overwrite?: boolean;
  /** name of the module. defaults to the project name */
  name?: string;
  isGlobal?: boolean;
}
