export interface CloudInstanceCreateExecutorSchema {
  /** Set the certificates to use for the service */
  certificate?: Array<string>;
  /** The domain names to use for the service */
  domain?: Array<string>;
  /** Set the entrypoint for the instance */
  entrypoint?: Array<string>;
  /** Environmental variables */
  env?: Array<string>;
  /** List of features to enable */
  feature?: Array<string>;
  /** Specify the amount of memory to allocate (MiB increments) */
  memory?: string;
  /** Specify the name of the instance */
  name?: string;
  /** Set output format. Options: table, yaml, json, list */
  output?: 'table' | 'yaml' | 'json' | 'list';
  /** Specify the port mapping between external to internal */
  port?: Array<string>;
  /** Number of replicas of the instance */
  replicas?: number;
  /** Set the restart policy for the instance (default 'never') */
  restart?: 'never' | 'always' | 'on-failure';
  /** Set the rollout strategy for an instance */
  rollout?: string;
  /** Set the rollout qualifier used for t... */
  'rollout-qualifier'?: string;
  /** Time to wait before performing rollout action (default '10s') */
  'rollout-wait'?: string;
  /** Scale to zero policy of the instance (default 'off') */
  'scale-to-zero'?: 'on' | 'off' | 'idle';
  /** Cooldown period before scaling to zero */
  'scale-to-zero-cooldown'?: string;
  /** Save state when scaling to zero */
  'scale-to-zero-stateful'?: boolean;
  /** Attach this instance to an existing service */
  service?: string;
  /** Immediately start the instance after creation */
  start?: boolean;
  /** Set the subdomains to use when creating the service */
  subdomain?: Array<string>;
  /** Specify the number of vCPUs to allocate */
  vcpus?: number;
  /** List of volumes to attach instance to */
  volume?: Array<string>;
  /** Wait for the image to be available before creating the instance */
  'wait-for-image'?: boolean;
  /** Time to wait before timing out when waiting for image (default '1m0s') */
  'wait-for-image-timeout'?: string;
  /** Path to the buildkit host */
  'buildkit-host'?: string;
}
