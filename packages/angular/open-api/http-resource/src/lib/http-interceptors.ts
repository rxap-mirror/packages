import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OpenApiConfigService } from '@rxap/open-api';
import { OPEN_API_SERVER_ID } from './http-context-tokens';

export const injectOpenApiBaseUrlHttpInterceptorFn: HttpInterceptorFn = (
  req,
  next
) => {
  const serverId = req.context.get(OPEN_API_SERVER_ID);
  const openApiConfigService = inject(OpenApiConfigService);
  if (serverId) {
    const baseUrl = openApiConfigService.getBaseUrl(undefined, serverId);
    return next(req.clone({ url: baseUrl + req.url }));
  }

  return next(req);
};
