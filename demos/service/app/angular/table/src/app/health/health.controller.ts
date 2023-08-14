import {
  Controller,
  Get,
  Inject,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  public healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

}
