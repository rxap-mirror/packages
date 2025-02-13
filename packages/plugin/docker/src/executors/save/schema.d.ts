export interface SaveExecutorSchema {
  /** output path for the tar.gz files */
  outputPath?: string;
  /** A suffix added to the base image name */
  imageSuffix?: string;
  /** The base image name */
  imageName?: string;
}
