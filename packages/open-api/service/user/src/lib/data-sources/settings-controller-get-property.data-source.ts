import {
  RxapOpenApiDataSource,
  OpenApiDataSource,
} from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { SettingsControllerGetPropertyResponse } from '../responses/settings-controller-get-property.response';
import { SettingsControllerGetPropertyParameter } from '../parameters/settings-controller-get-property.parameter';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('SettingsController_getProperty')
export class SettingsControllerGetPropertyDataSource
  extends OpenApiDataSource<SettingsControllerGetPropertyResponse, SettingsControllerGetPropertyParameter> {
}
