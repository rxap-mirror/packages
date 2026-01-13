import { Controller, Get } from '@nestjs/common';
import { Public, Environment } from '@rxap/nest-utilities';
import { ApiExcludeController } from '@nestjs/swagger';
import { environment } from '../environments/environment';

@Controller()
@Public()
@ApiExcludeController()
export class AppController {
  @Get()
  public async name(): Promise<string> {
    return environment.app;
  }

  @Get('info')
  public async environment(): Promise<Environment> {
    return environment;
  }
}
