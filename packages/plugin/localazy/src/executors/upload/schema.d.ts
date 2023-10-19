export interface UploadExecutorSchema {
  disableContentLength?: boolean;
  async?: boolean;
  project?: string;
  branch?: string;
  param?: string;
  failOnMissingGroups?: boolean;
  readKey?: string;
  writeKey?: string;
  keysJson?: string;
  configJson?: string;
  workingDirectory?: string;
  dryRun?: boolean;
  quite?: boolean;
  force?: boolean;
  version?: number;
  extractTarget?: string;
}
