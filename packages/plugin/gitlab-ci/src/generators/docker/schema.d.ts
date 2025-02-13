export interface DockerGeneratorSchema {
  /** Generate docker startup test with pull target to GCP registry */
  gcp?: boolean;
  /** Generate docker startup test with pull target to gitlab registry */
  gitlab?: boolean;
  /** Overwrite existing files */
  overwrite?: boolean;
  skipFormat?: boolean;
  /** If true, the gitlab ci will be initialized with components */
  components?: boolean;
  tags?: Array<string>;
  skipStartup?: boolean;
  skipE2eService?: boolean;
  project?: string;
}
