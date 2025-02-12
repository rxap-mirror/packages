import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { StatusControllerHealthCheckServiceParameter } from '../parameters/status-controller-health-check-service.parameter';
import { StatusControllerHealthCheckServiceResponse } from '../responses/status-controller-health-check-service.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('StatusController_healthCheckService')
export class StatusControllerHealthCheckServiceDataSource
  extends OpenApiDataSource<StatusControllerHealthCheckServiceResponse, StatusControllerHealthCheckServiceParameter> {
}
