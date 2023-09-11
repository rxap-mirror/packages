import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

export interface SetupCookieParserOptions {
  cookieParserOptions?: cookieParser.CookieParseOptions;
}

export function SetupCookieParser({ cookieParserOptions }: SetupCookieParserOptions = {}) {
  return (app: INestApplication, config: ConfigService) =>
    app.use(cookieParser(config.get('COOKIE_SECRET'), cookieParserOptions));
}
