import {
  Controller,
  Get,
  Inject,
  Logger,
} from '@nestjs/common';
import { GetOpenapiJson } from '@rxap/nest-open-api';
import {
  Environment,
  Public,
} from '@rxap/nest-utilities';
import { environment } from '../environments/environment';

@Controller()
@Public()
export class AppController {
  @Inject(Logger)
  private readonly logger!: Logger;

  @Get('info')
  environment(): Environment {
    return environment;
  }

  @Get()
  public name(): string {
    return environment.app;
  }

  @Get('openapi')
  public openapi(): void {
    return GetOpenapiJson(__dirname, this.logger);
  }
}
