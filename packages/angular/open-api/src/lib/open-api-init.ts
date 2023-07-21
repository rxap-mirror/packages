import { ConfigService } from '@rxap/config';
import { OpenApiConfigService } from './open-api-config.service';

export function OpenApiInit() {
  const api = ConfigService.Get<Record<string, { baseUrl?: string }> & { baseUrl: string }>(
    'api',
    {} as any,
    ConfigService.Config,
  );
  if (api.baseUrl) {
    OpenApiConfigService.InsertServer({
      url: api.baseUrl.match(/^https?:\/\//) ? api.baseUrl : location.origin + api.baseUrl,
    }, OpenApiConfigService.DefaultServerIndex);
  }
  for (const [ serverId, config ] of Object.entries(api)) {
    if (config && typeof config === 'object') {
      const baseUrl = config.baseUrl;
      if (baseUrl) {
        const url = baseUrl.match(/^https?:\/\//) ? baseUrl : location.origin + baseUrl;
        console.log(`Add server '${ serverId }' with url '${ url }'`);
        OpenApiConfigService.InsertServer({
          url,
        }, OpenApiConfigService.DefaultServerIndex, serverId);
      }
    }
  }
}
