// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DockerComposeGeneratorSchema {
  rootDomain?: string;
  tags: string[];
  ignoreProjects: string[];
  serviceEnvironments?: string[];
}
