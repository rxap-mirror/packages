import { Injectable } from '@angular/core';
import { AppControllerEnvironmentResponse } from '@rxap/open-api-service-status';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('AppController_environment')
export class AppControllerEnvironmentDataSource extends OpenApiDataSource<AppControllerEnvironmentResponse, void> {
}
