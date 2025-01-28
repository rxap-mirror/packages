export interface CloudInstanceStopExecutorSchema {
  /** Stop all instances */
  all?: boolean;
  /** Timeout for the instance to stop (ms/s/m/h) */
  'drain-timeout'?: string;
  /** Force stop the instance(s) */
  force?: boolean;
  /** Time to wait for the instance to drain all connections before stopping (ms/s/m/h) */
  wait?: string;
  /** Path to the buildkit host */
  'buildkit-host'?: string;
  /** Path to KraftKit configuration directory */
  'config-dir'?: string;
  /** Address of containerd daemon socket */
  'containerd-addr'?: string;
  /** Text editor for editing files */
  editor?: string;
  /** File storing events process ID for multiple unikernels */
  'events-pid-file'?: string;
  /** Preferred Git protocol (default 'https') */
  'git-protocol'?: string;
  /** Shared socket for HTTP(S) connections */
  'http-unix-sock'?: string;
  /** Log level verbosity (default 'info') */
  'log-level'?: string;
  /** Enable log timestamps */
  'log-timestamps'?: boolean;
  /** Log type (default 'fancy') */
  'log-type'?: string;
  /** Path to Unikraft manifest cache */
  'manifests-dir'?: string;
  /** Unikraft Cloud metro location */
  metro?: string;
  /** Disable update checks */
  'no-check-updates'?: boolean;
  /** Disable color output */
  'no-color'?: boolean;
  /** Disable emojis in output */
  'no-emojis'?: boolean;
  /** Disable parallel internal tasks */
  'no-parallel'?: boolean;
  /** Disable user prompts */
  'no-prompt'?: boolean;
  /** Disable warnings when running as sudo */
  'no-warn-sudo'?: boolean;
  /** System pager for output (default 'cat') */
  pager?: string;
  /** Path to KraftKit plugin directory */
  'plugins-dir'?: string;
  /** Path to QEMU executable */
  qemu?: string;
  /** Directory for runtime files */
  'runtime-dir'?: string;
  /** Path to Unikraft component cache */
  'sources-dir'?: string;
  /** Unikraft Cloud access token */
  token?: string;
  /** Paths to package or component manifests */
  'with-manifest'?: Array<string>;
  /** Mirrors of Unikraft component artifacts */
  'with-mirror'?: Array<string>;
}
