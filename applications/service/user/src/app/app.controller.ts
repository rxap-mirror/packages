import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  Public,
  Environment,
} from '@rxap/nest-utilities';
import { environment } from '../environments/environment';

@Controller()
@Public()
export class AppController {
  @Get()
  public name(): string {
    return environment.app;
  }

  @Get('info')
  public environment(): Environment {
    return environment;
  }
}
