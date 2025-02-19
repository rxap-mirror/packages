export interface UploadExecutorSchema {
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
  version?: string;
  /** Quiet mode. Print only important information. */
  quite?: boolean;
  /** Force the upload operation if the validation step fails. */
  force?: boolean;
  /** Perform the operation for the given release tag. */
  tag?: string;
  /** Automatically determine a tag and perform the operation for it. */
  autoTag?: boolean;
  /** The target that extracts or generate the translation source file. */
  extractTarget?: string;
  /** Disable Content-Length header when uploading data; use only when the upload  operation fails with 'bad request' */
  disableContentLength?: boolean;
  /** Do not wait for the server to process the uploaded data and report errors. */
  async?: boolean;
  /** Only perform upload if the project slug or ID match the specified one */
  project?: string;
  /** Perform the operation for the given branch */
  branch?: string;
  /** Add extra parameter for processing; format is key:value */
  param?: string;
  /** Fail when non-existent group is provided on the command line */
  failOnMissingGroups?: boolean;
}
