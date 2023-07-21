import {
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

export interface UpstreamApiHealthIndicator extends HealthIndicator {
  isHealthy(): Promise<HealthIndicatorResult>;
}
