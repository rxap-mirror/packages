import {
  Inject,
  Injectable,
  isDevMode,
  Optional,
} from '@angular/core';
import {
  OpenAPI,
  OpenAPIV3,
} from 'openapi-types';
import { OperationObjectWithMetadata } from './open-api';
import { RXAP_OPEN_API_CONFIG } from './tokens';
import { AssertOpenApiV3 } from './utilities';

export type OperationMap = Map<string, OperationObjectWithMetadata>;

@Injectable({ providedIn: 'root' })
export class OpenApiConfigService {
  public static Config: OpenAPIV3.Document | null = null;

  public static DefaultServerIndex = 0;

  private static _operations: OperationMap | null = null;
  public defaultServerIndex: number = OpenApiConfigService.DefaultServerIndex;
  private _operations: OperationMap | null = null;
  private static serverConfigMap = new Map<string | undefined, OpenAPIV3.ServerObject[]>();

  private get serverConfigMap(): Map<string | undefined, OpenAPIV3.ServerObject[]> {
    return OpenApiConfigService.serverConfigMap;
  }

  constructor(
    @Optional()
    @Inject(RXAP_OPEN_API_CONFIG)
      config: OpenAPIV3.Document | null = null,
  ) {
    config = config ?? OpenApiConfigService.Config;
    if (config) {
      this._config = config;
      this._operations = OpenApiConfigService.LoadOperations(config);
    }
    OpenApiConfigService.Config ??= config;
  }

  private _config: OpenAPIV3.Document | null = null;

  public get config(): OpenAPIV3.Document {
    if (!this._config) {
      throw new Error('Could not load open api config');
    }
    return this._config;
  }

  /**
   * Used to load the app open api config from a remote resource.
   *
   * Promise.all([ OpenApiDataSourceLoader.Load() ])
   * .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
   * .catch(err => console.error(err))
   *
   */
  public static async Load(openApiUrl = 'openapi.json'): Promise<void> {
    if (!openApiUrl) {
      throw new Error('The open api url is not defined!');
    }

    let config: OpenAPIV3.Document | null = null;
    try {
      const response = await fetch(openApiUrl);
      config = await response.json();
    } catch (error: any) {
      console.debug(
        `Could not load the open api config from '${ openApiUrl }'!`,
        error,
      );
      console.error(
        `Could not load the open api config from '${ openApiUrl }'!`,
        error.message,
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
        `The operation '${ operationId }' is not defined in the openapi-json`,
      );
    }
    return this._operations!.get(operationId)!;
  }

  private static LoadOperations(config: OpenAPIV3.Document): OperationMap {
    const operations = new Map<string, OperationObjectWithMetadata>();

    Object.entries(config.paths)
          .filter(
            (item): item is [ string, OpenAPIV3.PathItemObject ] =>
              item[0] !== undefined,
          )
          .filter(
            ([ _, methods ]: [ string, OpenAPIV3.PathItemObject ]) =>
              methods &&
              Object.keys(methods).some((method) =>
                [ 'get', 'put', 'post', 'delete', 'patch' ].includes(method),
              ),
          )
          .forEach(([ path, methods ]: [ string, OpenAPIV3.PathItemObject ]) =>
            Object.entries(methods)
                  .filter(
                    (item): item is [ string, OpenAPIV3.OperationObject ] =>
                      item[0] !== undefined,
                  )
                  .forEach(
                    ([ method, operation ]: [ string, OpenAPIV3.OperationObject ]) => {
                      if (!operation.operationId) {
                        throw new Error('The OpenApu OperationId is not defined');
                      }

                      if (operations!.has(operation.operationId)) {
                        throw new Error(
                          `The OpenApi Operation '${ operation.operationId }' is already defined.`,
                        );
                      }

                      operations!.set(operation.operationId, {
                        ...operation,
                        path: path,
                        method: method.toUpperCase(),
                      });
                    },
                  ),
          );

    return operations;
  }

  private static GetBaseUrl(
    config: OpenAPIV3.Document,
    serverIndex: number = this.DefaultServerIndex,
  ): string {
    const server = config.servers ? config.servers[serverIndex] : null;

    if (!server) {
      console.debug(
        `Could not extract the server config with the index '${ serverIndex }' from the open api config`,
        config,
      );
      throw new Error(
        `Could not extract the server config with the index '${ serverIndex }' from the open api config`,
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
    config: OpenAPI.Document,
  ): Promise<OpenAPI.Document> {
    return Promise.resolve(config);
  }

  public getOperation(operationId: string): OperationObjectWithMetadata {
    if (!this._operations) {
      if (!this._config) {
        throw new Error('The operations map is not loaded and the config object is not loaded');
      }
      this._operations = OpenApiConfigService.LoadOperations(this._config);
    }
    if (!this._operations.has(operationId)) {
      console.error(
        `The operation '${ operationId }' is not defined in the openapi-json`,
        isDevMode() ? this.config : undefined,
      );
      throw new Error(
        `The operation '${ operationId }' is not defined in the openapi-json`,
      );
    }
    return this._operations.get(operationId)!;
  }

  public getBaseUrl(serverIndex: number = this.defaultServerIndex, serverId?: string): string {
    let serverConfig: OpenAPIV3.ServerObject | undefined;
    const servers = this._config?.servers ?? [];
    if (!serverId && servers) {
      serverConfig = servers[serverIndex];
    }
    if (this.serverConfigMap.has(serverId)) {
      serverConfig = this.serverConfigMap.get(serverId)![serverIndex];
    }
    if (!serverConfig) {
      console.error(
        `Could not determine the base url with the index '${ serverIndex }' and the serverId '${ serverId }'`,
        isDevMode() ? servers : undefined,
      );
      throw new Error(`Could not determine the base url with the index '${ serverIndex }' and the serverId '${ serverId }'`);
    }
    return serverConfig.url;
  }

  public static InsertServer(
    serverConfig: OpenAPIV3.ServerObject,
    index: number,
    serverId?: string,
    config: OpenAPIV3.Document = this.Config!,
  ): void {
    if (!serverId && config) {
      if (!config.servers) {
        config.servers = [];
      }
      config.servers.splice(index, 1, serverConfig);
    }
    if (!this.serverConfigMap.has(serverId)) {
      this.serverConfigMap.set(serverId, []);
    }
    const list = this.serverConfigMap.get(serverId)!;
    list[index] = serverConfig;
    this.serverConfigMap.set(serverId, list);
  }

  public insertServer(
    serverConfig: OpenAPIV3.ServerObject,
    index: number = this.defaultServerIndex,
    serverId?: string,
  ): void {
    OpenApiConfigService.InsertServer(serverConfig, index, serverId, this.config);
  }

}
