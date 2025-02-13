export interface HealthIndicatorGeneratorSchema {
  /** The name of the health indicator class */
  name: string;
  /** The name of the project. */
  project: string;
  overwrite?: boolean;
}
