import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { ThemeControllerGetResponse } from '../responses/theme-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ThemeController_get')
export class ThemeControllerGetDataSource extends OpenApiDataSource<ThemeControllerGetResponse<TResponse>, void> {
}
