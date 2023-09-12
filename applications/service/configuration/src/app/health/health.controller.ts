import {
  Controller,
  Get,
  Inject,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { Public } from '@rxap/nest-utilities';
import { ConfigurationHealthIndicator } from './configuration-health-indicator.service';

@Controller('health')
@Public()
@ApiExcludeController()
export class HealthController {
  constructor(
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
    private readonly configurationHealthIndicator: ConfigurationHealthIndicator,
  ) {
  }

  @Get()
  @HealthCheck()
  public healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.configurationHealthIndicator.isHealthy(),
    ]);
  }
}
