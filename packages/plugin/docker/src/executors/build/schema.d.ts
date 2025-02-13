export interface BuildExecutorSchema {
  /** The docker build context path */
  context?: string;
  /** The path to the dockerfile */
  dockerfile?: string;
  /** A list of docker image tags */
  tag?: Array<string>;
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
  /** If true a destination with a latest tag is added */
  latest?: boolean;
  /** If true all created images are pushed */
  push?: boolean;
  buildArgList?: Array<string>;
}
