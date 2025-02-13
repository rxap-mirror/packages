export interface ConfigGeneratorSchema {
  /** The name of the project. */
  project: string;
  /** Path to context for the docker build process. */
  context?: string;
  /** Path to the dockerfile. */
  dockerfile?: string;
  /** The target from witch the output path can be extract. */
  buildTarget?: string;
  /** A suffix added to the base image name */
  imageSuffix?: string;
  /** The base image name */
  imageName?: string;
  /** The image registry */
  imageRegistry?: string;
  /** The command to start docker */
  command?: string;
  /** Whether to create a save target */
  save?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
}
