export interface CopyOpenApiSdkExecutorSchema {
  /** The name of the client SDK project to copy */
  clientSdkProject: string;
  /** Whether to copy the files for an Angular project */
  angular?: boolean;
  /** Whether to copy the files for a NestJS project */
  nestjs?: boolean;
  /** The directory to copy the files to */
  outputDir?: string;
  /** Whether to skip copying the directives */
  skipDirectives?: boolean;
  /** Whether to skip copying the data sources */
  skipDataSources?: boolean;
  /** Whether to skip copying the remote methods */
  skipRemoteMethods?: boolean;
}
