import { Injectable } from '@angular/core';
import {
  StatusControllerHealthCheckParameter,
  StatusControllerHealthCheckResponse,
} from '@rxap/open-api-service-status';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('StatusController_healthCheck')
export class StatusControllerHealthCheckDataSource
  extends OpenApiDataSource<StatusControllerHealthCheckResponse, StatusControllerHealthCheckParameter> {
}
