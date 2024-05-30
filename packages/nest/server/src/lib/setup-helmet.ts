import { INestApplication } from '@nestjs/common';
import helmet, { HelmetOptions } from 'helmet';

export interface SetupHelmetOptions {
  helmetOptions?: HelmetOptions;
}

/**
 * Sets up the Helmet middleware for the Nest application.
 *
 * @param {SetupHelmetOptions} [options] - The options to customize the Helmet middleware.
 * @param {object} [options.helmetOptions] - The configuration options for the Helmet middleware.
 *
 * @returns {MiddlewareFunction} - A middleware function that sets up the Helmet middleware.
 */
export function SetupHelmet({ helmetOptions }: SetupHelmetOptions = {}) {
  return (app: INestApplication) => app.use(helmet(helmetOptions));
}
