export interface CloudDeployExecutorSchema {
  /** Set the deployment type */
  as?: string;
  /** Supply build arguments when building a Dockerfile */
  'build-arg'?: Array<string>;
  /** Use the specified file to save the output from the build */
  'build-log'?: string;
  /** Supply secrets when building Dockerfile */
  'build-secret'?: Array<string>;
  /** Supply multi-stage target when building Dockerfile */
  'build-target'?: string;
  /** Set the certificates to use for the service */
  certificate?: Array<string>;
  /** Compress the initrd package (experimental) */
  compress?: boolean;
  /** Override the path to the KConfig .config file */
  config?: string;
  /** Build the debuggable (symbolic) kernel image instead of the stripped image */
  dbg?: boolean;
  /** Set the domain names for the service */
  domain?: Array<string>;
  /** Set the entrypoint for the instance */
  entrypoint?: Array<string>;
  /** Environmental variables */
  env?: Array<string>;
  /** Specify the special features to enable */
  feature?: Array<string>;
  /** Follow the logs of the instance */
  follow?: boolean;
  /** Force pulling packages before building */
  'force-pull'?: boolean;
  /** Show help for deploy */
  help?: boolean;
  /** Set the image name to use */
  image?: string;
  /** Allow N jobs at once */
  jobs?: number;
  /** Set the Kraftfile to use */
  kraftfile?: string;
  /** Specify the amount of memory to allocate (MiB increments) */
  memory?: string;
  /** Name of the deployment */
  name?: string;
  /** Force a rebuild even if existing intermediate artifacts already exist */
  'no-cache'?: boolean;
  /** Do not run Unikraft's configure step before building */
  'no-configure'?: boolean;
  /** Do not use maximum parallelization when performing the build */
  'no-fast'?: boolean;
  /** Do not run Unikraft's fetch step before building */
  'no-fetch'?: boolean;
  /** Do not start the instance after creation */
  'no-start'?: boolean;
  /** Do not update package index before running the build */
  'no-update'?: boolean;
  /** Set output format */
  output?: string;
  /** Specify the port mapping between external to internal */
  port?: Array<string>;
  /** Number of replicas of the instance */
  replicas?: number;
  /** Set the restart policy for the instance (never/always/on-failure) */
  restart?: string;
  /** Set the rollout strategy for an instance which has been previously run in the provided service */
  rollout?: string;
  /** Set the rollout qualifier used to determine which instances should be affected by the strategy in the supplied service */
  'rollout-qualifier'?: string;
  /** Time to wait before performing rolling out action */
  'rollout-wait'?: string;
  /** Specify a path to use as root filesystem */
  rootfs?: string;
  /** Set an alternative project runtime */
  runtime?: string;
  /** Scale to zero policy of the instance (on/off/idle) */
  'scale-to-zero'?: string;
  /** Cooldown period before scaling to zero */
  'scale-to-zero-cooldown'?: string;
  /** Save state when scaling to zero */
  'scale-to-zero-stateful'?: boolean;
  /** Attach the new deployment to an existing service */
  service?: string;
  /** When a package of the same name exists, use this strategy when applying targets */
  strategy?: string;
  /** Set the names to use when provisioning subdomains */
  subdomain?: Array<string>;
  /** Set the timeout for remote procedure calls */
  timeout?: string;
  /** Specify the number of vCPUs to allocate */
  vcpus?: number;
  /** Specify the volume mapping(s) in the form NAME:DEST or NAME:DEST:OPTIONS */
  volume?: Array<string>;
  /** Set an alternative working directory */
  workdir?: string;
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
  /** Preferred Git protocol to use */
  'git-protocol'?: string;
  /** When making HTTP(S) connections, pipe requests via this shared socket */
  'http-unix-sock'?: string;
  /** Log level verbosity */
  'log-level'?: string;
  /** Enable log timestamps */
  'log-timestamps'?: boolean;
  /** Log type */
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
  /** System pager to pipe output to */
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
  /** Paths to package or component manifests */
  'with-manifest'?: Array<string>;
  /** Paths to mirrors of Unikraft component artifacts */
  'with-mirror'?: Array<string>;
}
