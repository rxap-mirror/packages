import { InternalServerErrorException } from '@nestjs/common';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';

export function GetOpenapiJson(appRoot: string, logger: { error: (...args: any[]) => void } = console) {
  const openapiFilePath = join(appRoot, 'openapi.json');
  if (existsSync(openapiFilePath)) {
    try {
      return JSON.parse(readFileSync(openapiFilePath).toString('utf-8'));
    } catch (e: any) {
      logger.error(`openapi.json parse error: ${ e.message }`, undefined, 'GetOpenapiJson');
      throw new InternalServerErrorException(`openapi.json parse error: ${ e.message }`);
    }
  }
  logger.error(`openapi.json not found in ${ appRoot }`, undefined, 'GetOpenapiJson');
  throw new InternalServerErrorException('openapi.json not found');
}
