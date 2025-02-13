export interface InitGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to skip the docker configuration */
  skipDocker?: boolean;
  skipFormat?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  /** Whether to initialize authentik docker compose setup */
  authentik?: boolean;
  /** If true, the workspace will be initialized for standalone development */
  standalone?: boolean;
  /** Whether to initialize minio docker compose setup */
  minio?: boolean;
  authentication?: 'oauth2-proxy' | boolean;
  dockerImageName?: string;
  dockerImageSuffix?: string;
  dockerImageRegistry?: string;
}
