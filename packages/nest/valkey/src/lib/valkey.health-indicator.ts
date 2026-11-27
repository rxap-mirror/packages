import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { ValkeyService } from './valkey.service';

/** Timeout (ms) for the health probe, so a hung Valkey can't stall a check. */
const REACHABILITY_TIMEOUT_MS = 5000;

@Injectable()
export class ValkeyHealthIndicator {
  @Inject(HealthIndicatorService)
  private readonly healthIndicatorService!: HealthIndicatorService;

  @Inject(ValkeyService)
  private readonly valkey!: ValkeyService;

  async isHealthy(key = 'valkey') {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const pong = await this.withTimeout(this.valkey.ping());
      if (pong !== 'PONG') {
        return indicator.down({ message: `unexpected PING reply: ${pong}` });
      }
    } catch (e: any) {
      return indicator.down({
        message: e?.message ?? 'Valkey is not reachable',
      });
    }

    return indicator.up();
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<T>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Valkey health check timed out')),
        REACHABILITY_TIMEOUT_MS
      );
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }
}
