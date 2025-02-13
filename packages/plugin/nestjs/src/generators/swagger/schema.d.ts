export interface SwaggerGeneratorSchema {
  /** The name of the project. */
  project: string;
  overwrite?: boolean;
  /** Whether the nest service should be standalone */
  standalone?: boolean;
}
