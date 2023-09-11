import { INestApplication } from '@nestjs/common';
import helmet, { HelmetOptions } from 'helmet';

export interface SetupHelmetOptions {
  helmetOptions?: HelmetOptions;
}

export function SetupHelmet({ helmetOptions }: SetupHelmetOptions = {}) {
  return (app: INestApplication) => app.use(helmet(helmetOptions));
}
