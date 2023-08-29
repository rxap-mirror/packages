import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { StatusControllerHealthCheckResponse } from '../responses/status-controller-health-check.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('StatusController_healthCheck')
export class StatusControllerHealthCheckDataSource
  extends OpenApiDataSource<StatusControllerHealthCheckResponse, void> {
}
