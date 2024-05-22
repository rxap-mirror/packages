// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DockerGeneratorSchema {
  overwrite?: boolean;
  gcp?: boolean;
  gitlab?: boolean;
  tags?: string[];
  skipFormat?: boolean;
  components: boolean;
}
