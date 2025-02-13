export interface DeployExecutorSchema {
  /** The endpoint of the web3 storage service */
  endpoint?: string;
  /** The key used to authenticate with the web3 storage service */
  key?: string;
  /** The proof used to authenticate with the web3 storage service */
  proof?: string;
  /** The rate limit in seconds of the web3 storage service */
  rateLimit?: number;
  /** The build target from which the output should be deployed */
  buildTarget?: string;
}
