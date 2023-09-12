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

@Controller('health')
@Public()
@ApiExcludeController()
export class HealthController {
  constructor(
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  public healthCheck(): Promise<HealthCheckResult> {
    // TODO : add health checks
    return this.health.check([]);
  }
}
