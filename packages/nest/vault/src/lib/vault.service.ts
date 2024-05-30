import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  existsSync,
  readFileSync,
} from 'fs';
import * as Client from 'node-vault';
import { VAULT_OPTIONS } from './tokens';
import { VaultOptions } from './vault-options';

interface RequestOptions<Data = unknown> extends Record<string, unknown> {
  path: string;
  method: string;
  json?: Data;
}

export interface VaultResponse<Data = null, Auth = null> {
  request_id: string;
  lease_id: string;
  renewable: boolean;
  lease_duration: number;
  data: Data | null;
  wrap_info: null;
  warnings: null;
  auth: Auth | null;
  mount_type: string;
}

interface VaultAuth<Metadata = unknown> {
  client_token: string;
  policies: string[];
  metadata: Metadata;
  lease_duration: number;
  renewable: boolean;
}

export interface TokenLookupSelfData<Metadata = unknown> {
  accessor: string;
  creation_time: number;
  creation_ttl: number;
  display_name: string;
  entity_id: string;
  expire_time: string | null;
  explicit_max_ttl: number;
  id: string;
  identity_policies: string[];
  issue_time: string;
  meta: Metadata;
  num_uses: number;
  orphan: boolean;
  path: string;
  policies: string[];
  renewable: boolean;
  ttl: number;
}

interface KubernetesVaultAuthMetadata {
  role: string;
  service_account_name: string;
  service_account_namespace: string;
  service_account_secret_name: string;
  service_account_uid: string;
}

type KubernetesVaultAuth = VaultAuth<KubernetesVaultAuthMetadata>;

type KubernetesAuthResponse = VaultResponse<null, KubernetesVaultAuth>;

interface VaultClient {
  token: string;

  help<T>(path: string, requestOptions: Partial<RequestOptions>): Promise<VaultResponse<T>>;

  write<T>(path: string, data: any, requestOptions: Partial<RequestOptions>): Promise<VaultResponse<T>>;

  read<T>(path: string, requestOptions: Partial<RequestOptions>): Promise<VaultResponse<T>>;

  list<T>(path: string, requestOptions: Partial<RequestOptions>): Promise<VaultResponse<T>>;

  delete<T>(path: string, requestOptions: Partial<RequestOptions>): Promise<VaultResponse<T>>;

  request<T>(requestOptions: RequestOptions): Promise<T>;

  tokenRenewSelf({ increment }: { increment: string | number }): Promise<VaultResponse<null, VaultAuth>>;

  tokenLookupSelf(): Promise<VaultResponse<TokenLookupSelfData>>;

  kubernetesLogin({
    role,
    jwt,
    kubernetesPath
  }: { role: string; jwt: string, kubernetesPath?: string }): Promise<KubernetesAuthResponse>;
}

@Injectable()
export class VaultService {

  public client!: VaultClient;

  private readonly initialized: Promise<void>;

  constructor(
    @Inject(VAULT_OPTIONS)
    public readonly options: VaultOptions,
    @Inject(ConfigService)
    private readonly config: ConfigService,
    @Inject(Logger)
    private readonly logger: Logger
  ) {
    this.client = Client({
      apiVersion: this.options.apiVersion,
      endpoint: this.options.endpoint
    });
    if (this.config.get('VAULT_DISABLED')) {
      this.logger.verbose('Vault is disabled', 'VaultService');
      this.initialized = new Promise<void>(resolve => setTimeout(resolve, 24 * 60 * 60));
    } else {
      this.initialized = new Promise<void>(resolve => {
        this.getToken().then(token => {
          this.client.token = token;
          this.logger.log('Initialized vault client', 'VaultService');
          resolve();
        });
      });
    }
  }

  public async help<T>(path: string, requestOptions: Partial<RequestOptions> = {}): Promise<VaultResponse<T>> {
    this.logger.verbose(`Getting help for vault path '${ path }'`, 'VaultService');
    await this.initialized;
    return this.client.help<T>(path, requestOptions);
  }

  public async write<T>(
    path: string, data: any, requestOptions: Partial<RequestOptions> = {}): Promise<VaultResponse<T>> {
    this.logger.verbose(`Writing to vault path '${ path }'`, 'VaultService');
    await this.initialized;
    return this.client.write<T>(path, data, requestOptions);
  }

  public async read<T>(path: string, requestOptions: Partial<RequestOptions> = {}): Promise<VaultResponse<T>> {
    this.logger.verbose(`Reading vault path '${ path }'`, 'VaultService');
    await this.initialized;
    return this.client.read<T>(path, requestOptions);
  }

  public async list<T>(path: string, requestOptions: Partial<RequestOptions> = {}): Promise<VaultResponse<T>> {
    this.logger.verbose(`Listing vault path '${ path }'`, 'VaultService');
    await this.initialized;
    return this.client.list<T>(path, requestOptions);
  }

  public async delete<T>(path: string, requestOptions: Partial<RequestOptions> = {}): Promise<VaultResponse<T>> {
    this.logger.verbose(`Deleting vault path '${ path }'`, 'VaultService');
    await this.initialized;
    return this.client.delete<T>(path, requestOptions);
  }

  public async tokenRenewSelf({ increment }: { increment: string | number }): Promise<VaultResponse<null, VaultAuth>> {
    this.logger.verbose(`Renewing vault own token with increment '${ increment }'`, 'VaultService');
    await this.initialized;
    const response = await this.client.tokenRenewSelf({ increment });
    if (!response.auth?.client_token) {
      throw new Error(`Failed to renew vault token with increment '${ increment }'`);
    }
    this.logger.debug(`Set vault client token with renewed token with increment '${ increment }'`, 'VaultService');
    this.client.token = response.auth?.client_token;
    return response;
  }

  public async tokenLookupSelf(): Promise<VaultResponse<TokenLookupSelfData>> {
    // Commented out because it's is called in the health indicator.
    // This would spam the logs
    // this.logger.verbose('Looking up own token', 'VaultService');
    await this.initialized;
    return this.client.tokenLookupSelf();
  }

  /**
   * Renews a lease with the specified lease_id and increment.
   *
   * @param {object} params - The parameters for renewing the lease.
   * @param {string} params.lease_id - The ID of the lease to renew.
   * @param {string|number} params.increment - The increment for renewing the lease.
   * @returns {Promise<VaultResponse>} - A Promise that resolves to a VaultResponse object.
   */
  public async renewLease({
    lease_id,
    increment
  }: { lease_id: string; increment: string | number }): Promise<VaultResponse> {
    this.logger.verbose(`Renewing lease '${ lease_id }' with increment '${ increment }'`, 'VaultService');
    await this.initialized;
    return this.client.request({
      path: '/sys/leases/renew',
      method: 'POST',
      json: {
        lease_id,
        increment
      }
    });
  }

  private async getToken(): Promise<string> {
    if (this.options.token) {
      this.logger.verbose('Using token from options', 'VaultService');
      return this.options.token;
    }
    if (this.config.get('VAULT_TOKEN')) {
      this.logger.verbose('Using token from env VAULT_TOKEN', 'VaultService');
      return this.config.getOrThrow('VAULT_TOKEN');
    }
    if (this.options.kubernetesAuth) {
      this.logger.verbose('Using kubernetes auth to retrieve a token', 'VaultService');
      const role: string = this.getKubernetesRole(this.options.kubernetesAuth);
      const jwt: string = this.getKubernetesJwt(this.options.kubernetesAuth);
      const path: string | undefined = this.getKubernetesPath(this.options.kubernetesAuth);
      return this.kubernetesLogin(role, jwt, path);
    }
    if (this.config.get('VAULT_KUBERNETES_ROLE')) {
      this.logger.verbose('Using kubernetes auth to retrieve a token with env VAULT_KUBERNETES_ROLE', 'VaultService');
      const role: string = this.config.getOrThrow('VAULT_KUBERNETES_ROLE');
      const jwt: string = this.getKubernetesJwt();
      const path: string | undefined = this.getKubernetesPath();
      return this.kubernetesLogin(role, jwt, path);
    }
    throw new Error('No authentication method provided for vault');
  }

  private getKubernetesRole(kubernetesAuth?: VaultOptions['kubernetesAuth']): string {

    if (typeof kubernetesAuth === 'object' && kubernetesAuth?.role) {
      this.logger.verbose('Using kubernetes login role from options', 'VaultService');
      return kubernetesAuth.role;
    }

    if (this.config.get('VAULT_KUBERNETES_ROLE')) {
      this.logger.verbose('Using kubernetes login role from env VAULT_KUBERNETES_ROLE', 'VaultService');
      return this.config.getOrThrow('VAULT_KUBERNETES_ROLE');
    }

    throw new Error(
      'Vault login with kubernetes auth requires a role. Either provide it in the options or set the VAULT_KUBERNETES_ROLE environment variable');
  }

  private getKubernetesJwt(kubernetesAuth?: VaultOptions['kubernetesAuth']): string {

    if (typeof kubernetesAuth === 'object' && kubernetesAuth?.jwt) {
      this.logger.verbose('Using kubernetes login jwt from options', 'VaultService');
      return kubernetesAuth.jwt;
    }

    if (this.config.get('VAULT_KUBERNETES_JWT')) {
      this.logger.verbose('Using kubernetes login jwt from env VAULT_KUBERNETES_JWT', 'VaultService');
      return this.config.getOrThrow('VAULT_KUBERNETES_JWT');
    }

    if (existsSync('/var/run/secrets/kubernetes.io/serviceaccount/token')) {
      this.logger.verbose(
        'Using kubernetes login jwt from /var/run/secrets/kubernetes.io/serviceaccount/token', 'VaultService');
      return readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
    }

    throw new Error(
      'Vault login with kubernetes auth requires a jwt token. Either provide it in the options, set the VAULT_KUBERNETES_JWT environment variable or mount the token at /var/run/secrets/kubernetes.io/serviceaccount/token');
  }

  private getKubernetesPath(kubernetesAuth?: VaultOptions['kubernetesAuth']): string | undefined {
    if (typeof kubernetesAuth === 'object' && kubernetesAuth?.path) {
      this.logger.verbose('Using kubernetes login path from options', 'VaultService');
      return kubernetesAuth.path;
    }
    if (this.config.get('VAULT_KUBERNETES_PATH')) {
      this.logger.verbose('Using kubernetes login path from env VAULT_KUBERNETES_PATH', 'VaultService');
      return this.config.getOrThrow('VAULT_KUBERNETES_PATH');
    }
    return undefined;
  }

  private async kubernetesLogin(role: string, jwt: string, path: string | undefined): Promise<string> {
    this.logger.debug(
      `Logging into vault using kubernetes auth with role '${ role }' and path '${ path ?? 'kubernetes' }'`,
      'VaultService'
    );
    const response = await this.client.kubernetesLogin({
      role,
      jwt,
      kubernetesPath: path
    });
    if (!response.auth) {
      throw new Error('Failed to login to vault using kubernetes auth');
    }
    const { auth: { client_token } } = response;
    return client_token;
  }

}
