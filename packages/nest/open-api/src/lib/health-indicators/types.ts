import { HealthIndicatorResult } from '@nestjs/terminus';

export interface UpstreamApiHealthIndicator {
  isHealthy(): Promise<HealthIndicatorResult>;
}
