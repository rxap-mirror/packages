import { INestApplicationContext } from '@nestjs/common';
import { RxapLogger } from '@rxap/nest-logger';

export function UseRxapLoggerFactory() {
  return (app: INestApplicationContext) => app.get(RxapLogger);
}
