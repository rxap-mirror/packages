import { Injectable } from '@angular/core';
import { HealthControllerHealthCheckResponse } from '@rxap/open-api-service-status';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('HealthController_healthCheck')
export class HealthControllerHealthCheckDataSource
  extends OpenApiDataSource<HealthControllerHealthCheckResponse, void> {
}
