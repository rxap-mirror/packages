// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DockerGeneratorSchema {
  overwrite?: boolean;
  project?: string;
  gcp?: boolean;
  gitlab?: boolean;
  tags?: string[];
  skipFormat?: boolean;
  components: boolean;
  skipStartup?: boolean;
  skipE2eService?: boolean;
}
