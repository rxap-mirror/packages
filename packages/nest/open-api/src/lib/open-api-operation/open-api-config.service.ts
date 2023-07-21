import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  OpenApiServerConfig,
  OpenApiUpstreamInterceptor,
} from './types';
import {
  OPEN_API_SERVER_CONFIG,
  OPEN_API_SERVER_ID_META_DATA_KEY,
  OPEN_API_UPSTREAM_INTERCEPTOR,
} from './tokens';
import { coerceArray } from '@rxap/utilities';

@Injectable()
export class OpenApiConfigService {

  public readonly serverConfig: OpenApiServerConfig[];
  public readonly upstreamInterceptor: Record<string | '__default__', OpenApiUpstreamInterceptor[]>;

  constructor(
    @Inject(OPEN_API_SERVER_CONFIG)
      serverConfig: OpenApiServerConfig | OpenApiServerConfig[],
    @Inject(OPEN_API_UPSTREAM_INTERCEPTOR)
      upstreamInterceptor: OpenApiUpstreamInterceptor | OpenApiUpstreamInterceptor[],
    protected readonly logger: Logger,
  ) {
    this.serverConfig = coerceArray(serverConfig);
    this.upstreamInterceptor = this.createUpstreamInterceptorMap(coerceArray(upstreamInterceptor));
  }

  getBaseUrl(serverId: string): string {
    const config = this.serverConfig.find(c => c.id === serverId);
    if (!config) {
      this.logger.error(`Could not find server config for: '${ serverId }'`);
      this.logger.verbose(`Available server configs: ${ JSON.stringify(this.serverConfig.map(sc => sc.id)) }`);
      throw new Error(`Could not find server config for: '${ serverId }'`);
    }
    return config.url;
  }

  buildUrl(path: string, serverId?: string): string {
    if (serverId) {
      return this.getBaseUrl(serverId) + path;
    }
    return path;
  }

  getInterceptors(serverId: string): OpenApiUpstreamInterceptor[] {
    const specificInterceptor = this.upstreamInterceptor[serverId] ?? [];
    const defaultInterceptor = this.upstreamInterceptor['__default__'] ?? [];
    return [ ...specificInterceptor, ...defaultInterceptor ];
  }

  private createUpstreamInterceptorMap(upstreamInterceptor: OpenApiUpstreamInterceptor[]): Record<string, OpenApiUpstreamInterceptor[]> {

    const map: Record<string, OpenApiUpstreamInterceptor[]> = {};

    for (const interceptor of upstreamInterceptor) {

      const serverId = Reflect.getMetadata(OPEN_API_SERVER_ID_META_DATA_KEY, interceptor.constructor);

      if (!serverId || typeof serverId !== 'string') {
        throw new InternalServerErrorException(
          'Ensure the OpenApiUpstreamInterceptor has the @OpenApiServerId decorator');
      }

      if (!map[serverId]) {
        map[serverId] = [];
      }

      map[serverId].push(interceptor);

    }

    return map;

  }

}
