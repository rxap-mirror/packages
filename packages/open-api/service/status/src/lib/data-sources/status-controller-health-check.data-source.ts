import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { StatusControllerHealthCheckParameter } from '../parameters/status-controller-health-check.parameter';
import { StatusControllerHealthCheckResponse } from '../responses/status-controller-health-check.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('StatusController_healthCheck')
export class StatusControllerHealthCheckDataSource
  extends OpenApiDataSource<StatusControllerHealthCheckResponse, StatusControllerHealthCheckParameter> {
}
