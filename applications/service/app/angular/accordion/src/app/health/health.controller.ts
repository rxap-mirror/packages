import { Controller, Inject, Get } from '@nestjs/common';
import { Public } from '@rxap/nest-utilities';
import { ApiExcludeController } from '@nestjs/swagger';
import { HealthCheckService, HealthCheckResult, HealthCheck } from '@nestjs/terminus';

@Controller('health')
@Public()
@ApiExcludeController()
export class HealthController {
  constructor(@Inject(HealthCheckService) private readonly health: HealthCheckService) {
  }

  @Get()
  @HealthCheck()
  public healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
