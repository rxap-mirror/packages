import { INestApplication } from '@nestjs/common';
import type {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';


export interface SetupCorsOptions {
  corsOptions?: CorsOptions | CorsOptionsDelegate<any>;
}

export function SetupCors({ corsOptions }: SetupCorsOptions = {}) {
  return (app: INestApplication) =>
    app.enableCors({
      credentials: true,
      origin: true,
      ...(corsOptions ?? {}),
    });
}
