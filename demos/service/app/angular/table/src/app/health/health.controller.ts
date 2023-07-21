import {
  Controller,
  Inject,
} from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
  ) {}
}
