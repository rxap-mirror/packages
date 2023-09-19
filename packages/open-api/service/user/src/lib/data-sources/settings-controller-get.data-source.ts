import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { SettingsControllerGetResponse } from '../responses/settings-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('SettingsController_get')
export class SettingsControllerGetDataSource extends OpenApiDataSource<SettingsControllerGetResponse<TResponse>, void> {
}
