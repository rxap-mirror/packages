import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  Environment,
  Public,
} from '@rxap/nest-utilities';
import { environment } from '../environments/environment';

@Controller()
@Public()
export class AppController {
  @Get()
  public async environment(): Promise<Environment> {
    return environment;
  }
}