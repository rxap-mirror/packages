import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  OpenApiConfigService,
} from './open-api-config.service';
import { OPEN_API_SERVER_ID, OPEN_API_SERVER_INDEX } from './http-context-tokens';
import { JoinPath } from '@rxap/utilities';

export const injectOpenApiBaseUrlHttpInterceptorFn: HttpInterceptorFn = (
  req,
  next
) => {
  const serverId = req.context.get(OPEN_API_SERVER_ID);
  const serverIndex = req.context.get(OPEN_API_SERVER_INDEX);
  const openApiConfigService = inject(OpenApiConfigService);
  if (serverId) {
    const baseUrl = openApiConfigService.getBaseUrl(serverIndex, serverId);
    if (req.url.startsWith('http')) {
      if (!req.url.startsWith(baseUrl)) {
        console.warn(`The url ${req.url} is not a valid url for the server ${serverId}. Expected base url ${baseUrl}`);
      }
    } else {
      const url = JoinPath(baseUrl, req.url);
      return next(req.clone({ url }));
    }
  }

  return next(req);
};
