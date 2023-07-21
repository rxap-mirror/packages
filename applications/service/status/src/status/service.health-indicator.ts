import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';

@Injectable()
export abstract class ServiceHealthIndicator extends HealthIndicator {
  constructor(
    protected readonly http: HttpService,
    protected readonly config: ConfigService,
    protected readonly logger: Logger,
    protected readonly baseUrl: string,
    protected readonly key: string,
    protected readonly healthPath: string = '/health',
    protected readonly infoPath: string = '',
  ) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {

    this.logger.verbose(`Check health for : '${ this.baseUrl }'`, 'ServiceHealthIndicator');

    try {
      await firstValueFrom(this.http.get(`${ this.baseUrl }${ this.healthPath }`, { timeout: 30 * 1000 }));
    } catch (e: any) {
      if (e instanceof AxiosError) {
        this.handleAxiosError(e);
      }
      throw new HealthCheckError(
        `${ this.key } is in an unknown state`,
        this.getStatus(this.key, false, { message: e.message }),
      );
    }

    return this.getServiceInfo();

  }

  protected handleAxiosError(e: AxiosError) {
    if (e.response) {
      if (e.response.status === 503) {
        throw new HealthCheckError(
          `${ this.key } is unhealthy`,
          this.getStatus(this.key, false, { code: e.code, data: e.response.data, message: e.message }),
        );
      } else {
        throw new HealthCheckError(
          `${ this.key } is in an unknown state`,
          this.getStatus(
            this.key,
            false,
            { code: e.code, status: e.response.status, statusText: e.response.statusText, message: e.message, data: e.response.data },
          ),
        );
      }
    } else {
      throw new HealthCheckError(
        `${ this.key } is not reachable`,
        this.getStatus(this.key, false, { code: e.code, message: e.message }),
      );
    }
  }

  protected async getServiceInfo(): Promise<HealthIndicatorResult> {
    try {
      const response = await firstValueFrom(this.http.get(`${ this.baseUrl }${ this.infoPath }`));
      return this.getStatus(this.key, true, { data: response.data });
    } catch (e: any) {
      throw new HealthCheckError(
        `${ this.key } is in an unknown state`,
        this.getStatus(this.key, false, { message: e.message }),
      );
    }
  }

}
