export interface DownloadExecutorSchema {
  /** Provide the writeKey on the command line. */
  readKey?: string;
  /** Provide the readkey on the command line. */
  writeKey?: string;
  /** Override the keys file name. */
  keysJson?: string;
  /** Override the configuration file name. */
  configJson?: string;
  /** Set the working directory that all paths are relative to. */
  workingDirectory?: string;
  /** Do not perform the actual operation, only simulate the process. No files are uploaded nor written. */
  dryRun?: boolean;
  /** Quiet mode. Print only important information. */
  quite?: boolean;
  /** Force the upload operation if the validation step fails. */
  force?: boolean;
  /** Automatically determine a tag and perform the operation for it. */
  autoTag?: boolean;
  /** Perform the operation for the given release tag. */
  tag?: string;
  /** Perform the operation for the given branch */
  branch?: string;
  /** Add extra parameter for processing; format is key:value */
  param?: string;
  /** Fail when non-existent group is provided on the command line */
  failOnMissingGroups?: boolean;
}
