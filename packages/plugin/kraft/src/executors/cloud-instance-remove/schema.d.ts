export interface CloudInstanceRemoveExecutorSchema {
  /** Remove all instances */
  all?: boolean;
  /** Help for remove */
  help?: boolean;
  /** Remove all stopped instances */
  stopped?: boolean;
  /** Path to the buildkit host */
  'buildkit-host'?: string;
  /** Path to KraftKit config directory */
  'config-dir'?: string;
  /** Address of containerd daemon socket */
  'containerd-addr'?: string;
  /** Set the text editor to open when prompt to edit a file */
  editor?: string;
  /** Events process ID used when running multiple unikernels */
  'events-pid-file'?: string;
  /** Preferred Git protocol to use (default "https") */
  'git-protocol'?: string;
  /** When making HTTP(S) connections, pipe requests via this shared socket */
  'http-unix-sock'?: string;
  /** Log level verbosity. Choice of: [panic, fatal, error, warn, info, debug, trace] (default "info") */
  'log-level'?: string;
  /** Enable log timestamps */
  'log-timestamps'?: boolean;
  /** Log type. Choice of: [fancy, basic, json] (default "fancy") */
  'log-type'?: string;
  /** Path to Unikraft manifest cache */
  'manifests-dir'?: string;
  /** Unikraft Cloud metro location */
  metro?: string;
  /** Do not check for updates */
  'no-check-updates'?: boolean;
  /** Disable color output */
  'no-color'?: boolean;
  /** Do not use emojis in any console output */
  'no-emojis'?: boolean;
  /** Do not run internal tasks in parallel */
  'no-parallel'?: boolean;
  /** Do not prompt for user interaction */
  'no-prompt'?: boolean;
  /** Do not warn on running via sudo */
  'no-warn-sudo'?: boolean;
  /** System pager to pipe output to (default "cat") */
  pager?: string;
  /** Path to KraftKit plugin directory */
  'plugins-dir'?: string;
  /** Path to QEMU executable */
  qemu?: string;
  /** Directory for placing runtime files (e.g., pidfiles) */
  'runtime-dir'?: string;
  /** Path to Unikraft component cache */
  'sources-dir'?: string;
  /** Unikraft Cloud access token */
  token?: string;
  /** Paths to package or component manifests (default [https://manifests.kraftkit.sh/index.yaml]) */
  'with-manifest'?: Array<string>;
  /** Paths to mirrors of Unikraft component artifacts */
  'with-mirror'?: Array<string>;
}
