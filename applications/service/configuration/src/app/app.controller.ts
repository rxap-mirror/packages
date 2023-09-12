import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import {
  Environment,
  Public,
} from '@rxap/nest-utilities';
import { environment } from '../environments/environment';

@Controller()
@Public()
@ApiExcludeController()
export class AppController {

  @Get('info')
  environment(): Environment {
    return environment;
  }

  @Get()
  public name(): string {
    return environment.app;
  }

}
