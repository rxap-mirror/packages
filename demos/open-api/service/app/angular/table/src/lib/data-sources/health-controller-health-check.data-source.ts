import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { HealthControllerHealthCheckResponse } from '../responses/health-controller-health-check.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('HealthController_healthCheck')
export class HealthControllerHealthCheckDataSource
  extends OpenApiDataSource<HealthControllerHealthCheckResponse, void> {
}
