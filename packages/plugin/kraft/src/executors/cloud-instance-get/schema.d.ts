export enum CloudInstanceGetOutputExecutorSchemaEnum {
  TABLE = 'table',
  YAML = 'yaml',
  JSON = 'json',
  LIST = 'list'
}

export enum CloudInstanceGetLogLevelExecutorSchemaEnum {
  PANIC = 'panic',
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export enum CloudInstanceGetLogTypeExecutorSchemaEnum {
  FANCY = 'fancy',
  BASIC = 'basic',
  JSON = 'json'
}

export interface CloudInstanceGetExecutorSchema {
  /** Set output format (options: table, yaml, json, list) */
  output?: CloudInstanceGetOutputExecutorSchemaEnum;
  /** Path to the BuildKit host */
  'buildkit-host'?: string;
  /** Path to KraftKit config directory */
  'config-dir'?: string;
  /** Address of containerd daemon socket */
  'containerd-addr'?: string;
  /** Text editor to open when prompted to edit a file */
  editor?: string;
  /** Events process ID for multiple unikernels */
  'events-pid-file'?: string;
  /** Preferred Git protocol */
  'git-protocol'?: string;
  /** Shared socket for HTTP(S) requests */
  'http-unix-sock'?: string;
  /** Log level verbosity */
  'log-level'?: CloudInstanceGetLogLevelExecutorSchemaEnum;
  /** Enable log timestamps */
  'log-timestamps'?: boolean;
  /** Log type */
  'log-type'?: CloudInstanceGetLogTypeExecutorSchemaEnum;
  /** Unikraft Cloud metro location */
  metro?: string;
  /** Do not check for updates */
  'no-check-updates'?: boolean;
  /** Disable color output */
  'no-color'?: boolean;
  /** Do not use emojis in console output */
  'no-emojis'?: boolean;
  /** Do not run internal tasks in parallel */
  'no-parallel'?: boolean;
  /** Do not prompt for user interaction */
  'no-prompt'?: boolean;
  /** Do not warn when running via sudo */
  'no-warn-sudo'?: boolean;
  /** System pager to pipe output to */
  pager?: string;
  /** Path to KraftKit plugin directory */
  'plugins-dir'?: string;
  /** Path to QEMU executable */
  qemu?: string;
  /** Directory for runtime files placement */
  'runtime-dir'?: string;
  /** Path to Unikraft component cache */
  'sources-dir'?: string;
  /** Unikraft Cloud access token */
  token?: string;
  /** Paths to package or component manifests */
  'with-manifest'?: Array<string>;
  /** Paths to mirrors of Unikraft component artifacts */
  'with-mirror'?: Array<string>;
}
