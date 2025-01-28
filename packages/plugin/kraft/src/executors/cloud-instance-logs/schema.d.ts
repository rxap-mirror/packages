export enum CloudInstanceLogsLogLevelExecutorSchemaEnum {
  PANIC = 'panic',
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export enum CloudInstanceLogsLogTypeExecutorSchemaEnum {
  FANCY = 'fancy',
  BASIC = 'basic',
  JSON = 'json'
}

export interface CloudInstanceLogsExecutorSchema {
  /** Follow the logs of the instance every half second. */
  follow?: boolean;
  /** Do not prefix each log line with the name when logging multiple machines. */
  'no-prefix'?: boolean;
  /** Prefix the logs with a given string. */
  prefix?: string;
  /** Show the last given lines from the logs (default -1). */
  tail?: number;
  /** Path to the buildkit host. */
  'buildkit-host'?: string;
  /** Path to KraftKit config directory. */
  'config-dir'?: string;
  /** Address of containerd daemon socket. */
  'containerd-addr'?: string;
  /** Text editor to open when prompted to edit a file. */
  editor?: string;
  /** Events process ID used when running multiple unikernels. */
  'events-pid-file'?: string;
  /** Preferred Git protocol to use (default 'https'). */
  'git-protocol'?: string;
  /** Shared socket for HTTP(S) connections. */
  'http-unix-sock'?: string;
  /** Log level verbosity (default 'info'). */
  'log-level'?: CloudInstanceLogsLogLevelExecutorSchemaEnum;
  /** Enable log timestamps. */
  'log-timestamps'?: boolean;
  /** Log type (default 'fancy'). */
  'log-type'?: CloudInstanceLogsLogTypeExecutorSchemaEnum;
  /** Path to Unikraft manifest cache. */
  'manifests-dir'?: string;
  /** Unikraft Cloud metro location. */
  metro?: string;
  /** Do not check for updates. */
  'no-check-updates'?: boolean;
  /** Disable color output. */
  'no-color'?: boolean;
  /** Do not use emojis in console output. */
  'no-emojis'?: boolean;
  /** Do not run internal tasks in parallel. */
  'no-parallel'?: boolean;
  /** Do not prompt for user interaction. */
  'no-prompt'?: boolean;
  /** Do not warn when running via sudo. */
  'no-warn-sudo'?: boolean;
  /** System pager to pipe output to (default 'cat'). */
  pager?: string;
  /** Path to KraftKit plugin directory. */
  'plugins-dir'?: string;
  /** Path to QEMU executable. */
  qemu?: string;
  /** Directory for placing runtime files (e.g., pidfiles). */
  'runtime-dir'?: string;
  /** Path to Unikraft component cache. */
  'sources-dir'?: string;
  /** Unikraft Cloud access token. */
  token?: string;
  /** Paths to package or component manifests (default '[https://manifests.kraftkit.sh/index.yaml]'). */
  'with-manifest'?: Array<string>;
  /** Paths to mirrors of Unikraft component artifacts. */
  'with-mirror'?: Array<string>;
}
