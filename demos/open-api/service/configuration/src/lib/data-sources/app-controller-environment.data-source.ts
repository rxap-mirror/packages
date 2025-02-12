import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { AppControllerEnvironmentResponse } from '../responses/app-controller-environment.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('AppController_environment')
export class AppControllerEnvironmentDataSource extends OpenApiDataSource<AppControllerEnvironmentResponse, void> {
}
