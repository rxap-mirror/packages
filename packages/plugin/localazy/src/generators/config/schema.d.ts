export interface ConfigGeneratorSchema {
  /** The name of the project. */
  project: string;
  /** The target that extracts or generate the translation source file. */
  extractTarget?: string;
  /** The localazy write key. */
  writeKey?: string;
  /** The localazy read key. */
  readKey?: string;
  /** Overwrite existing files. */
  overwrite?: boolean;
}
