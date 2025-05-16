import { INestApplication } from '@nestjs/common';
import type {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';


export interface SetupCorsOptions {
  corsOptions?: CorsOptions | CorsOptionsDelegate<any>;
}

export function SetupCors({ corsOptions }: SetupCorsOptions = {}) {
  return (app: INestApplication, config: ConfigService) =>
    app.enableCors({
      credentials: config.get('CORS_CREDENTIALS', true),
      origin: config.get('CORS_ORIGIN', true),
      allowedHeaders: config.get('CORS_ALLOWED_HEADERS', ['sentry-trace', 'baggage']),
      exposedHeaders: config.get('CORS_EXPOSED_HEADERS'),
      methods: config.get('CORS_METHODS'),
      ...corsOptions,
    });
}
