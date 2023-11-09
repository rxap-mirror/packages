import { ConfigService } from '@rxap/config';
import { Environment } from '@rxap/environment';
import { JoinPath } from '@rxap/utilities';
import { OpenApiConfigService } from './open-api-config.service';

export interface OpenApiInitOptions {
  /**
   * true - load the open api config file from the default url
   * default url: openapi.json
   */
  load?: {
    openApiUrl?: string;
  } | boolean;
  /**
   * The location origin prefix for the open api base urls if the base url is not absolute. defaults to location.origin
   */
  origin?: string;
}

export function OpenApiInit(environment: Environment, options: OpenApiInitOptions = {}) {
  const api = ConfigService.Get<Record<string, { baseUrl?: string }> & { baseUrl: string }>(
    'api',
    {} as any,
    ConfigService.Config,
  );
  options.origin ??= environment.origin ?? location.origin;
  options.load ??= environment.openApi?.load ?? false;
  if (api.baseUrl) {
    OpenApiConfigService.InsertServer({
      url: api.baseUrl.match(/^https?:\/\//) ? api.baseUrl : JoinPath(options.origin, api.baseUrl),
    }, OpenApiConfigService.DefaultServerIndex);
  }
  for (const [ serverId, config ] of Object.entries(api)) {
    if (config && typeof config === 'object') {
      const baseUrl = config.baseUrl;
      if (baseUrl) {
        const url = baseUrl.match(/^https?:\/\//) ? baseUrl : JoinPath(options.origin, baseUrl);
        console.debug(`Add server '${ serverId }' with url '${ url }'`);
        OpenApiConfigService.InsertServer(
          { url },
          OpenApiConfigService.DefaultServerIndex,
          serverId,
        );
      }
    }
  }
  if (options.load) {
    return OpenApiConfigService.Load(typeof options.load === 'object' ? options.load.openApiUrl : undefined);
  }
  return undefined;
}
