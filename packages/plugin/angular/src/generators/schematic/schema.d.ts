export interface SchematicGeneratorSchema {
  /** The name of the project. */
  project: string;
  /** Schematic name. */
  name: string;
  /** Schematic description. */
  description?: string;
  /** Do not format files with prettier. */
  skipFormat?: boolean;
}
