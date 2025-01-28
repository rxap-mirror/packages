export interface CloudImgRemoveExecutorSchema {
  /** Remove all images */
  all?: boolean;
  /** Path to the buildkit host */
  'buildkit-host'?: string;
  /** Path to KraftKit config directory */
  'config-dir'?: string;
  /** Address of containerd daemon socket */
  'containerd-addr'?: string;
  /** Set the text editor for file editing prompts */
  editor?: string;
  /** PID for events process used with multiple unikernels */
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
  /** Disable colored output */
  'no-color'?: boolean;
  /** Disable emojis in console output */
  'no-emojis'?: boolean;
  /** Run tasks serially instead of in parallel */
  'no-parallel'?: boolean;
  /** Disable user interaction prompts */
  'no-prompt'?: boolean;
  /** Suppress warnings when running with sudo */
  'no-warn-sudo'?: boolean;
  /** System pager to pipe output to (default 'cat') */
  pager?: string;
  /** Path to KraftKit plugin directory */
  'plugins-dir'?: string;
  /** Path to QEMU executable */
  qemu?: string;
  /** Directory for placing runtime files */
  'runtime-dir'?: string;
  /** Path to Unikraft component cache */
  'sources-dir'?: string;
  /** Unikraft Cloud access token */
  token?: string;
  /** Paths to package/component manifests */
  'with-manifest'?: Array<string>;
  /** Paths to mirrors of Unikraft component artifacts */
  'with-mirror'?: Array<string>;
}
