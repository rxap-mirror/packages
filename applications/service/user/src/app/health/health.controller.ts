import {
  Controller,
  Inject,
  Get,
} from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheckResult,
  HealthCheck,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(@Inject(HealthCheckService) private readonly health: HealthCheckService) {
  }

  @Get()
  @HealthCheck()
  public healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
