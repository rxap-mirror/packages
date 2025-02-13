export interface RenameGeneratorSchema {
  /** The name of project that should be renamed */
  project?: string;
  /** The new name of the project */
  name?: string;
  tags?: Array<string>;
}
