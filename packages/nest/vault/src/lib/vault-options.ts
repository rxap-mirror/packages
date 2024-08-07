export interface VaultOptions {
  /**
   * The version of the vault API to use. If not provided, the default value is `v1`.
   */
  apiVersion?: string;
  /**
   * The URL of the vault server to connect to. If not provided, the `VAULT_ADDR` environment variable will be used.
   */
  endpoint?: string;
  /**
   * The token to use for authentication with the vault server. If not provided, the `VAULT_TOKEN` environment
   * variable will be used.
   */
  token?: string;
  /**
   * If defined, the kubernetes authentication method will be used to authenticate with the vault server.
   * If the `VAULT_KUBERNETES_ROLE` environment variable is set, kubernetes authentication will be used by default.
   */
  kubernetesAuth?: boolean | {
    /**
     * If true, the token will be automatically renewed before it expires. If not provided, the `VAULT_KUBERNETES_AUTO_RENEW`
     * environment variable will be used. If that is not set, the default value is `false`.
     */
    autoRenew?: boolean;
    /**
     * The role to use for authentication with the vault server. If not provided, the `VAULT_KUBERNETES_ROLE`
     * environment variable will be used.
     */
    role?: string;
    /**
     * The JWT token to use for authentication with the vault server. If not provided, and the file at
     * /var/run/secrets/kubernetes.io/serviceaccount/token exists, the contents of that file will be used.
     */
    jwt?: string;
    /**
     * The vault path for the kubernetes auth backend.
     */
    path?: string;
  };
}
