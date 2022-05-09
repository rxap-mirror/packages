import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';
import { OperationObjectWithMetadata } from './open-api';
import { RXAP_OPEN_API_CONFIG } from './tokens';
import {
  OpenAPIV3,
  OpenAPI
} from 'openapi-types';
import { AssertOpenApiV3 } from './utilities';

export type OperationMap = Map<string, OperationObjectWithMetadata>;

@Injectable({ providedIn: 'root' })
export class OpenApiConfigService {
  public static Config: OpenAPIV3.Document | null = null;

  public static DefaultServerIndex: number = 0;

  private static _operations: OperationMap | null = null;

  /**
   * Used to load the app open api config from a remote resource.
   *
   * Promise.all([ OpenApiDataSourceLoader.Load() ])
   * .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
   * .catch(err => console.error(err))
   *
   */
  public static async Load(openApiUrl: string = 'openapi.json'): Promise<void> {
    if (!openApiUrl) {
      throw new Error('The open api url is not defined!');
    }

    let config: OpenAPIV3.Document | null = null;
    try {
      const response = await fetch(openApiUrl);
      config         = await response.json();
    } catch (error: any) {
      console.debug(
        `Could not load the open api config from '${openApiUrl}'!`,
        error
      );
      console.error(
        `Could not load the open api config from '${openApiUrl}'!`,
        error.message
      );
    }

    if (config) {
      const expandedConfig = await this.ExpandOpenApi(config);

      AssertOpenApiV3(expandedConfig);

      this.Config = expandedConfig;
    } else {
      this.Config = null;
    }
  }

  public static GetOperation(operationId: string): OperationObjectWithMetadata {
    if (!this.Config) {
      throw new Error('Could not load open api config');
    }

    if (!this._operations) {
      this._operations = this.LoadOperations(this.Config);
    }
    if (!this._operations!.has(operationId)) {
      throw new Error(
        `The operation '${operationId}' is not defined in the openapi-json`
      );
    }
    return this._operations!.get(operationId)!;
  }

  private static LoadOperations(config: OpenAPIV3.Document): OperationMap {
    const operations = new Map<string, OperationObjectWithMetadata>();

    Object.entries(config.paths)
      .filter(
        (item): item is [string, OpenAPIV3.PathItemObject] =>
          item[0] !== undefined
      )
      .filter(
        ([_, methods]: [string, OpenAPIV3.PathItemObject]) =>
          methods &&
          Object.keys(methods).some((method) =>
            ['get', 'put', 'post', 'delete', 'patch'].includes(method)
          )
      )
      .forEach(([path, methods]: [string, OpenAPIV3.PathItemObject]) =>
        Object.entries(methods)
          .filter(
            (item): item is [string, OpenAPIV3.OperationObject] =>
              item[0] !== undefined
          )
          .forEach(
            ([method, operation]: [string, OpenAPIV3.OperationObject]) => {
              if (!operation.operationId) {
                throw new Error('The OpenApu OperationId is not defined');
              }

              if (operations!.has(operation.operationId)) {
                throw new Error(
                  `The OpenApi Operation '${operation.operationId}' is already defined.`
                );
              }

              operations!.set(operation.operationId, {
                ...operation,
                path: path,
                method: method.toUpperCase(),
              });
            }
          )
      );

    return operations;
  }

  private static GetBaseUrl(
    config: OpenAPIV3.Document,
    serverIndex: number = this.DefaultServerIndex
  ): string {
    const server = config.servers ? config.servers[serverIndex] : null;

    if (!server) {
      console.debug(
        `Could not extract the server config with the index '${serverIndex}' from the open api config`,
        config
      );
      throw new Error(
        `Could not extract the server config with the index '${serverIndex}' from the open api config`
      );
    }

    return server.url;
  }

  /**
   * Replaces all $ref with the concrete definition
   *
   * @param config
   * @private
   */
  private static ExpandOpenApi(
    config: OpenAPI.Document
  ): Promise<OpenAPI.Document> {
    return Promise.resolve(config);
  }

  public get config(): OpenAPIV3.Document {
    if (!this._config) {
      throw new Error('Could not load open api config');
    }
    return this._config;
  }

  public defaultServerIndex: number = OpenApiConfigService.DefaultServerIndex;

  private _operations: OperationMap | null = null;

  private serverConfigMap = new Map<string | undefined, OpenAPIV3.ServerObject[]>();

  private _config: OpenAPIV3.Document | null = null;

  constructor(
    @Optional()
    @Inject(RXAP_OPEN_API_CONFIG)
    config: OpenAPIV3.Document | null = null
  ) {
    config = config ?? OpenApiConfigService.Config;
    if (config) {
      this._config = config;
      this._operations = OpenApiConfigService.LoadOperations(config);
    }
  }

  public getOperation(operationId: string): OperationObjectWithMetadata {
    if (!this._operations) {
      if (!this._config) {
        throw new Error('The operations map is not loaded and the config object is not loaded');
      }
      this._operations = OpenApiConfigService.LoadOperations(this._config);
    }
    if (!this._operations.has(operationId)) {
      console.debug(
        `The operation '${operationId}' is not defined in the openapi-json`,
        this.config
      );
      throw new Error(
        `The operation '${operationId}' is not defined in the openapi-json`
      );
    }
    return this._operations.get(operationId)!;
  }

  public getBaseUrl(serverIndex: number = this.defaultServerIndex, serverId?: string): string {
    let serverConfig: OpenAPIV3.ServerObject | undefined;
    if (!serverId && this._config?.servers) {
      serverConfig = this._config.servers[serverIndex];
    }
    if (this.serverConfigMap.has(serverId)) {
      serverConfig = this.serverConfigMap.get(serverId)![serverIndex];
    }
    if (!serverConfig) {
      throw new Error(`Could not determine the base url with the index: ${serverIndex} and the serverId: ${serverId}`);
    }
    return OpenApiConfigService.GetBaseUrl(this.config, serverIndex);
  }

  public insertServer(
    serverConfig: OpenAPIV3.ServerObject,
    index: number = this.defaultServerIndex,
    serverId?: string
  ): void {
    if (this._config) {
      if (!this.config.servers) {
        this.config.servers = [];
      }
      this.config.servers.splice(index, 1, serverConfig);
    }
    if (!this.serverConfigMap.has(serverId)) {
      this.serverConfigMap.set(serverId, []);
    }
    const list = this.serverConfigMap.get(serverId)!;
    list[index] = serverConfig;
    this.serverConfigMap.set(serverId, list);
  }
}
