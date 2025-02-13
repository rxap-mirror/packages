export interface GitlabCiGeneratorSchema {
  /** Generate docker startup test with pull target to GCP registry */
  gcp?: boolean;
  /** Generate docker startup test with pull target to gitlab registry */
  gitlab?: boolean;
  /** Overwrite existing files */
  overwrite?: boolean;
  skipFormat?: boolean;
  tags?: Array<string>;
}
