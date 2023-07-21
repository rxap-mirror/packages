import {
  Controller,
  Get,
} from '@nestjs/common';
import { environment } from '../environments/environment';
import { Public } from '@rxap/nest-utilities';

@Controller()
@Public()
export class AppController {
  @Get()
  environment() {
    return environment;
  }
}
