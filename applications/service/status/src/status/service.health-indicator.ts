import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ServiceRegistryService } from './service-registry.service';

@Injectable()
export class ServiceHealthIndicator extends HealthIndicator {
  constructor(
    protected readonly http: HttpService,
    protected readonly config: ConfigService,
    protected readonly logger: Logger,
    protected readonly serviceRegistryService: ServiceRegistryService,
  ) {
    super();
  }

  public async isHealthy(serviceName: string): Promise<HealthIndicatorResult> {

    if (!this.serviceRegistryService.has(serviceName)) {
      throw new HealthCheckError(
        `Service is not registered`,
        this.getStatus(serviceName, false, { message: `Service is not registered` }),
      );
    }

    const baseUrl = this.serviceRegistryService.get(serviceName);

    this.logger.verbose(
      `Check health for service '${ serviceName }' with url '${ baseUrl }'`,
      'ServiceHealthIndicator',
    );

    try {
      await firstValueFrom(this.http.get(`${ baseUrl }/health`, { timeout: 30 * 1000 }));
    } catch (e: any) {
      if (e instanceof AxiosError) {
        this.handleAxiosError(e, serviceName);
      }
      throw new HealthCheckError(
        `${ serviceName } is in an unknown state`,
        this.getStatus(serviceName, false, { message: e.message }),
      );
    }

    return this.getServiceInfo(serviceName);

  }

  protected handleAxiosError(e: AxiosError, serviceName: string) {
    if (e.response) {
      if (e.response.status === 503) {
        throw new HealthCheckError(
          `is unhealthy`,
          this.getStatus(serviceName, false, { code: e.code, data: e.response.data, message: e.message }),
        );
      } else {
        throw new HealthCheckError(
          `is in an unknown state`,
          this.getStatus(
            serviceName,
            false,
            { code: e.code, status: e.response.status, statusText: e.response.statusText, message: e.message, data: e.response.data },
          ),
        );
      }
    } else {
      throw new HealthCheckError(
        `is not reachable`,
        this.getStatus(serviceName, false, { code: e.code, message: e.message }),
      );
    }
  }

  protected async getServiceInfo(serviceName: string): Promise<HealthIndicatorResult> {

    const baseUrl = this.serviceRegistryService.get(serviceName);

    try {
      const response = await firstValueFrom(this.http.get(`${ baseUrl }/info`));
      return this.getStatus(serviceName, true, { data: response.data });
    } catch (e: any) {
      throw new HealthCheckError(
        `could not get service info`,
        this.getStatus(serviceName, false, { message: e.message }),
      );
    }
  }

}
