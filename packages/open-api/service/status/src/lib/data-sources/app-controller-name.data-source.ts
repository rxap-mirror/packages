import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { AppControllerNameResponse } from '../responses/app-controller-name.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('AppController_name')
export class AppControllerNameDataSource extends OpenApiDataSource<AppControllerNameResponse, void> {
}
