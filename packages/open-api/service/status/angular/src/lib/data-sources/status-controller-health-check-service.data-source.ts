import { Injectable } from '@angular/core';
import {
  StatusControllerHealthCheckServiceParameter,
  StatusControllerHealthCheckServiceResponse,
} from '@rxap/open-api-service-status';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('StatusController_healthCheckService')
export class StatusControllerHealthCheckServiceDataSource
  extends OpenApiDataSource<StatusControllerHealthCheckServiceResponse, StatusControllerHealthCheckServiceParameter> {
}
