import { Injectable } from '@angular/core';
import { AppControllerNameResponse } from '@rxap/open-api-service-configuration';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('AppController_name')
export class AppControllerNameDataSource extends OpenApiDataSource<AppControllerNameResponse, void> {
}
