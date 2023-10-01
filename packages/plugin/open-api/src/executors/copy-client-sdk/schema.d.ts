export interface CopyClientSdkExecutorSchema {
  clientSdkProject: string;
  angular?: boolean;
  nestJs?: boolean;
  outputDir: string;
  skipDataSources?: boolean;
  skipDirectives?: boolean;
  skipRemoteMethods?: boolean;
}
