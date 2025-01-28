export interface CloudTunnelExecutorSchema {
  /** The local port */
  localPort?: string;
  /** The dest port */
  destPort: string;
  /** The url path added to the link preview */
  urlPath?: string;
  /** Command-and-control port used by the tunneling service. */
  'tunnel-control-port'?: number;
  /** Tunnel service image */
  'tunnel-image'?: string;
  /** Remote port exposed by the tunnelling service. */
  'tunnel-proxy-port'?: Array<string>;
  /** Path to the buildkit host */
  'buildkit-host'?: string;
  /** Path to KraftKit config directory */
  'config-dir'?: string;
  /** Address of containerd daemon socket */
  'containerd-addr'?: string;
  /** Set the text editor for editing files */
  editor?: string;
  /** Events process ID for running multiple unikernels */
  'events-pid-file'?: string;
  /** Preferred Git protocol to use */
  'git-protocol'?: string;
  /** Shared socket for HTTP(S) connections */
  'http-unix-sock'?: string;
  /** Log level verbosity */
  'log-level'?: string;
  /** Enable log timestamps */
  'log-timestamps'?: boolean;
  /** Log type format */
  'log-type'?: string;
  /** Path to Unikraft manifest cache */
  'manifests-dir'?: string;
  /** Unikraft Cloud metro location */
  metro?: string;
  /** Disable update checks */
  'no-check-updates'?: boolean;
  /** Disable color output */
  'no-color'?: boolean;
  /** Disable emojis in console output */
  'no-emojis'?: boolean;
  /** Disable parallel task execution */
  'no-parallel'?: boolean;
  /** Disable user interaction prompts */
  'no-prompt'?: boolean;
  /** Suppress sudo warnings */
  'no-warn-sudo'?: boolean;
  /** System pager to use for output */
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
  /** Paths to mirrors of Unikraft component artifacts */
  'with-mirror'?: Array<string>;
}
